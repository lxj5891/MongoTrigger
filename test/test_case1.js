print("------- Case 1 -------");

db.metadata.embeddeds.drop();
db.users.drop();
db.documents.drop();

use admin;
db.runCommand({shardcollection:"test.documents",key:{_id:1}});

db.runCommand({shardcollection:"test.users",key:{_id:1}});

db.runCommand({shardcollection:"test.metadata.embeddeds",key:{_id:1}});


use test;

db.metadata.embeddeds.insert({referrer: {collection: 'documents', field: 'author', multi: false }, master: {collection: 'users', fields: ['name', 'age']}});

db.users.insert({"_id" : ObjectId("539c511fb2980377adc224cd"), name: 'sakurai',  age: 42});
// }
var now = new Date();
for ( var i = 0 ;i < 10000 ;i ++ ){
// i= 4;

	db.documents.insert({"_id" : 'id' + i , title: 'doc1' + i, author: {"_id" : ObjectId("539c511fb2980377adc224cd") }});

}

db.users.update({"_id" : ObjectId("539c511fb2980377adc224cd")}, {$set: {"name": 'sakurai13'}});

var finish =  new Date();
var mis = finish.getTime() - now.getTime();
print(mis + "ms");

sleep(100);

// var document0 = db.documents.findOne({"_id" : 'id4', {"author.name":1});
// var document1 = {"_id":'id4', "author":{"name":"sakurai2"}};
// assert.eq.automsg(document0, document1);

// db.runCommand( { shardcollection : "test.documents",key : {_id: 1} } )
