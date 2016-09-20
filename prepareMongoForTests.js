db.createCollection('_sites');
db.createCollection('site-test-users');

db.getCollection('_sites').insert({"_id": "test", "free_register": true});