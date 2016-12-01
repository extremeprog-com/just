require('core-os');

classes.DbMigrate = {
    initDbMigrate: function() {
        var
              request = CatchRequest(MSAServer_Init)
            , db      = request.app.db;


        return function(success, fail) {

            console.log(123123123);

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

                                        if(!j && !i) success();
                                    })(docs[j], j)
                                }
                            })
                        } else {
                            if(!i) success();
                        }
                    })(sites[i], i);
                }
            });
        }
    }
};