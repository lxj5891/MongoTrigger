
// Case 3 ancestors
// embeddeds との併用
print("------- Case 3 ancestors & embeddeds -------");

function passInt(val){
	if(val < 10){
		return "00" + val;
	}
	if(val > 9 && val < 100) {
		return "0" + val;
	}
	return val;
}

db.metadata.ancestors.drop();
db.books.drop();
db.metadata.ancestors.insert({collection: 'categories', parent: 'parent', ancestors: 'ancestors'});
db.metadata.embeddeds.drop();
db.metadata.embeddeds.insert({referrer: {collection: 'books', field: 'categories', multi: true}, master: {collection: 'categories', fields: ['ancestors']}});


db.categories.drop();
db.categories.insert({ _id: "node1"  , parent: null });
db.categories.insert({ _id: "node01" , parent: "node1"});
db.categories.insert({ _id: "node02" , parent: "node1"});
db.categories.insert({ _id: "node03" , parent: "node1"});

for ( var i = 0 ;i < 300 ;i ++ ) {

	db.categories.insert( { _id: "node" + passInt(i) , parent: "node01"});
}	

for ( var i = 300 ;i < 600 ;i ++ ) {

	db.categories.insert( { _id: "node" + passInt(i) , parent: "node02"});
}	

for ( var i = 600 ;i < 900 ;i ++ ) {
	
	db.categories.insert( { _id: "node" + passInt(i) , parent: "node03"});
}

// db.categories.update( {_id: "node015"}, {$set: {parent: "node02"}});

// db.categories.update( {_id: "node02"}, {$set: {parent: "node1"}});


// db.books.insert( {_id: "A", categories: [{_id: "node015"}]} );

// var Obj_50 = db.books.findOne( {_id: "A"}, {categories: 1} );

// printjson(Obj_50);

