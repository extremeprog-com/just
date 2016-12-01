const mongodb = require('mongodb');

var mongoClient = mongodb.MongoClient;
var mongoHost   = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mongo-sites';

mongoClient.connect(mongoHost, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server from environment variable MONGO_URL=' + mongoHost + '. Error:', err);
        setTimeout(function () {
            process.exit();
        }, 5000);
    } else {
        console.log('Connected to mongodb.');

        db.collection('_sites').find().toArray(function (err, sites) {

            for(var i = sites.length; i--; ) {
                (function(site, i) {
                    if(site.hash_key) {
                        db.collection('_sites').update({_id: site._id}, {$unset: {hash_key: 1}});

                        db.collection('site-' + site._id + '-users').find().toArray(function(err, docs) {
                            if(!docs) return;

                            for(var j = docs.length; j--; ) {
                                (function(d, j) {
                                    if(d.passwordHash && d.passwordHash.indexOf(':') < 0) {
                                        d.passwordHash = site.hash_key + ':' + d.passwordHash;
                                        db.collection('site-' + site._id + '-users').update({_id: d._id}, d);
                                    }

                                    if(!j && !i) db.close();
                                })(docs[j], j)
                            }
                        })
                    } else {
                        if(!i) db.close();
                    }
                })(sites[i], i);
            }
        });
    }
});