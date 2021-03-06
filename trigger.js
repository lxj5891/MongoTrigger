// MongoDB Extention
//  * Embeddeds Pattern
//  * Ancestors Pattern

var metadata = 'metadata';
var metadata_embeddeds = 'embeddeds'; // metadata.embeddeds
var metadata_ancestors = 'ancestors'; // metadata.ancestors

var stop_collection = 'test.stop'; // database:test collection:stop

// for Sharding Environment.
function connect( name ) {
	return db.getSisterDB( name );
}

//////////////////////////////////////////////////////

function do_ancestors( op, tag, infos ) {
	var done = false;
	for ( var i = 0; i < infos.length; i++ ) {
		var info = infos[i];
		if ( info.collection != tag[1] ) continue;
		update_ancestors( tag[0], op, info );
		done = true;
	}
	return done;
}

function update_ancestors( db, op, info ) {
	var field = info.parent; 
	var o = op.o['$set'] || op.o;
	if ( !o[field] ) return;

	var conn = connect( db );
	var collection = conn[ info.collection ];
	var select = {};
	select[ info.ancestors ] = 1;

	var _id = op.o2 ? op.o2._id : o._id;

	var parent_ancestors = get_ancestors( conn, info, select, o[field] );
	var myself_ancestors = get_ancestors( conn, info, select, _id );
	var length = myself_ancestors.length - 1;

	var condition = {}; 
	condition[ info.ancestors ] = { $in: [ _id ] };
	var cursor = collection.find( condition, select );
	while ( cursor.hasNext() ) {
		var object = cursor.next();
		var ancestors = object.ancestors || [];
		ancestors = parent_ancestors.concat( ancestors.slice( length ) );
		update( collection, object._id, info.ancestors, ancestors );
	}
}

function get_ancestors( conn, info, fields, _id ) {
	if ( !_id ) return [];
	fields = fields || {};
	fields[ info.ancestors ] = 1;
	var collection = conn[ info.collection ];
	var object = collection.findOne( { _id: _id }, fields );
	if ( !object ) return [];
	var ancestors = object[ info.ancestors ];
	if ( !ancestors ) {
		var parent_ancestors = get_ancestors( conn, info, fields, object[ info.parent ] );
		ancestors = parent_ancestors.concat( object._id );
		update( collection, object._id, info.ancestors, ancestors );
	}
	return ancestors;
}

function update( collection, _id, key, value ) {
	var object = {};
	object[ key ] = value;
	collection.update( { _id: _id }, { $set: object } );
}

//////////////////////////////////////////////////////

function do_embeddeds( op, tag, infos ) {
	var done = false;
	if ( op.o2 === undefined ) return done;
	for ( var i = 0; i < infos.length; i++ ) {
		var info = infos[i];
		if ( info.master.collection != tag[1] ) continue;
		var master = get_master( op.o, info );
		if ( !master ) continue;
		var referrer = get_referrer( op.o2, info );
		if ( !referrer ) continue;
		var conn = connect( info.referrer.db || tag[0] );
		conn[ info.referrer.collection ].update( referrer, { $set: master }, { multi: true } );
		done = true;
	}
	return done;
}

function get_master( data, info ) {
	var obj = {};
	var fields = info.master.fields;
	var referrer_field = info.referrer.multi ? [info.referrer.field, '$'].join('.') : info.referrer.field;
	var update = false;
	for ( var i = 0; i < fields.length; i++ ) {
		var field = fields[i];
		var o = data['$set'] || data;
		if ( !o[field] ) continue;
		obj[ [referrer_field, field].join('.') ] = o[field];
		update = true;
	}
	return update ? obj : null;
}

function get_referrer( data, info ) {
	if ( !data._id ) return null;
	var obj = info.referrer.condition ? info.referrer.condition : {};
	obj[ [info.referrer.field, '_id'].join('.') ] = data._id;
	return obj;
}

//////////////////////////////////////////////////////

// Trigger Definition
var trigger_data = {};
var trigger_func = {
	embeddeds: do_embeddeds,
	ancestors: do_ancestors
};

var option = DBQuery.Option.awaitData | DBQuery.Option.tailable;
var cursor = connect( 'local' ).oplog.rs.find().addOption( option );

for ( var stop = false, cursor = cursor.skip( cursor.count() ); !stop; ) {
	var now = new Date();
//printjson( now );

	while ( cursor.hasNext() ) {
		var op = cursor.next();
//printjson( op );
		if ( op.ns === stop_collection ) {
			stop = true;
			break;
		}

		// Primary Server Only.
		if ( rs.isMaster().primary != rs.isMaster().me ) {
			continue;
		}

		var tag = op.ns.split('.');
		trigger_data[ tag[0] ] = trigger_data[ tag[0] ] || {};
		if ( tag[1] === metadata && tag[2] ) {
			var conn = connect( tag[0] );
			var collection = op.ns.slice( op.ns.indexOf('.') + 1 );
			trigger_data[ tag[0] ][ tag[2] ] = conn[collection].find().toArray();
		}

		for ( var key in trigger_func ) {
			var data = trigger_data[ tag[0] ][ key ];
			if ( !data ) continue; // null, undefined, empty array

			var start = new Date();
			var done = trigger_func[ key ]( op, tag, data );
			if ( done ) {
				var time = (new Date()) - start;
				printjson( { trigger: key, time: time, collection: op.ns } );
			}
		}
	}

	// Safety Trap for busy loop.
	if ( (new Date()) - now < 100 ) {
		break;
	}
}
