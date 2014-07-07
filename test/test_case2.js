// Case 2
// フィールド名がドットを含む場合
print("------- Case 2 -------");

db.metadata.embeddeds.drop();
db.users.drop();
db.documents.drop();

db.metadata.embeddeds.insert({referrer: {collection: 'documents', field: 'author', multi: true}, master: {collection: 'users', fields: ['name.first', 'age']}});
db.users.insert({"_id" : ObjectId("539c511fb2980377adc224cd"), name: {last: 'sakurai', first: 'hajime'}, age: 42});
db.documents.insert({"_id" : ObjectId("539c511fb2980377adc224ca"), title: 'doc1', author: [{"_id" : ObjectId("539c511fb2980377adc224cd")}]});
db.users.update({"_id" : ObjectId("539c511fb2980377adc224cd")}, {$set: {"name.first": 'hajime2'}});

sleep(100);

var document0 = db.documents.findOne({"_id" : ObjectId("539c511fb2980377adc224ca")}, {"author.name.first":1});
var document1 = {"_id":ObjectId("539c511fb2980377adc224ca"), "author":[{"name":{"first":"hajime2"}}]};
assert.eq.automsg(document0, document1);
