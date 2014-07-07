
// Case 5
print("------- Case 5 -------");

db.metadata.embeddeds.drop();
db.groups.drop();
db.documents.drop();

db.metadata.embeddeds.insert({referrer: {collection: 'documents', field: 'groups', multi: true}, master: {collection: 'groups', fields: ['name', 'parents']}});
db.groups.insert({"_id" : ObjectId("539c511fb2980377adc224cd"), name: 'develop', parents: [
ObjectId("539c511fb2980377adc224cd"),
ObjectId("539c511fb2980377adc224ce"),
ObjectId("539c511fb2980377adc224cf")
]});
db.documents.insert({"_id" : ObjectId("539c511fb2980377adc224ca"), title: 'doc1', groups: [{"_id" : ObjectId("539c511fb2980377adc224cd")}]});

sleep(500);

db.groups.update({"_id" : ObjectId("539c511fb2980377adc224cd")}, {$set: {"parents": [
ObjectId("539c511fb2980377adc224cf"),
ObjectId("539c511fb2980377adc224ce"),
ObjectId("539c511fb2980377adc224cd")
]}});
sleep(500);
var doc0 = db.documents.findOne({"_id": ObjectId("539c511fb2980377adc224ca")}, {"groups.parents":1});
var doc1 = { "_id" : ObjectId("539c511fb2980377adc224ca"), "groups" : [ { "parents" : [ ObjectId("539c511fb2980377adc224cf"), ObjectId("539c511fb2980377adc224ce"), ObjectId("539c511fb2980377adc224cd") ] } ] }
assert.eq.automsg(doc0, doc1);
