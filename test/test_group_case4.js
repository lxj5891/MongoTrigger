
// Case 3 ancestors
// embeddeds との併用
print("------- Case 3 ancestors & embeddeds -------");

db.metadata.ancestors.drop();
db.metadata.ancestors.insert({collection: 'categories', parent: 'parent', ancestors: 'ancestors'});
db.metadata.embeddeds.drop();
db.metadata.embeddeds.insert({referrer: {collection: 'books', field: 'categories', multi: true}, master: {collection: 'categories', fields: ['ancestors']}});


db.categories.drop();
db.categories.insert( { _id: "Books",       parent: null          } );
db.categories.insert( { _id: "Programming", parent: "Books"       } );
db.categories.insert( { _id: "Databases",   parent: "Programming" } );
db.categories.insert( { _id: "Languages",   parent: "Programming" } );
db.categories.insert( { _id: "MongoDB",     parent: "Databases"   } );
db.categories.insert( { _id: "dbm",         parent: "Databases"   } );

db.books.drop();
db.books.insert( {_id: "A", categories: [{_id: "MongoDB"}]} );


db.categories.update( {_id: "MongoDB"}, {$set: {parent: "Languages"}});
sleep(200);
var Obj_40 = db.categories.findOne( {_id: "MongoDB"}, {ancestors: 1} );
var Obj_41 = { "_id" : "MongoDB", "ancestors" : [ "Books", "Programming", "Languages", "MongoDB" ] }
assert.eq.automsg(Obj_20, Obj_21);

var Obj_50 = db.books.findOne( {_id: "A"}, {categories: 1} );
var Obj_51 = { "_id" : "A", "categories" : [ { "_id" : "MongoDB", "ancestors" : [ "Books", "Programming", "Languages", "MongoDB" ] } ] };
assert.eq.automsg(Obj_50, Obj_51);