
// Case 3
// 配列型で複数のレコードが更新対象の場合
print("------- Case 3 -------");

db.metadata.embeddeds.drop();
db.users.drop();
db.documents.drop();

db.metadata.embeddeds.insert({referrer: {collection: 'documents', field: 'author', multi: true}, master: {collection: 'users', fields: ['name.first', 'age']}});
db.users.insert({"_id" : ObjectId("539c511fb2980377adc224cd"), name: {last: 'sakurai', first: 'hajime'}, age: 42});
db.documents.insert({"_id" : ObjectId("539c511fb2980377adc224ca"), title: 'doc1', author: [{"_id" : ObjectId("539c511fb2980377adc224cd")}]});
db.documents.insert({"_id" : ObjectId("539c511fb2980377adc224cb"), title: 'doc2', author: [{"_id" : ObjectId("539c511fb2980377adc224cd")}]});
db.documents.insert({"_id" : ObjectId("539c511fb2980377adc224cc"), title: 'doc3', author: [{"_id" : ObjectId("539c511fb2980377adc224ce")}]});
db.users.update({"_id" : ObjectId("539c511fb2980377adc224cd")}, {$set: {"name.first": 'hajime2'}});

sleep(100);

var doc1_0 = db.documents.findOne({"_id" : ObjectId("539c511fb2980377adc224ca")}, {"author.name.first":1});
var doc1_1 = {"_id":ObjectId("539c511fb2980377adc224ca"), "author":[{"name":{"first":"hajime2"}}]};
assert.eq.automsg(doc1_0, doc1_1);

var doc2_0 = db.documents.findOne({"_id" : ObjectId("539c511fb2980377adc224cb")}, {"author.name.first":1});
var doc2_1 = {"_id":ObjectId("539c511fb2980377adc224cb"), "author":[{"name":{"first":"hajime2"}}]};
assert.eq.automsg(doc2_0, doc2_1);

var doc3_0 = db.documents.findOne({"_id" : ObjectId("539c511fb2980377adc224cc")}, {"author.name.first":1});
var doc3_1 = {"_id":ObjectId("539c511fb2980377adc224cc"), "author" : [{}] };
assert.eq.automsg(doc3_0, doc3_1);

