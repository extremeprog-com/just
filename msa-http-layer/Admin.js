require('core-os');

/** @name Admin_CloneDbRq*/
Core.registerRequestPoint('Admin_CloneDbRq');

classes.Admin = {
    initAdminAPI: function() {
        var
            request = CatchRequest(MSAServer_Init)
            , app     = request.app;

        return function (success, fail) {
            app.post('/api/admin/dbinit', app.parser(function (site, data, cb, user, res, req) {
                if(!data.key) {
                    res.status(403);
                    cb(['Authorization required']);
                    return;
                }

                if(!data.sitename) {
                    res.status(403);
                    cb(['Sitename required']);
                    return;
                }


            }));

            app.post('/api/admin/dbclone', app.parser(function (site, data, cb, user, res, req) {
                if(!data.key) {
                    res.status(403);
                    cb(['Authorization required']);
                    return;
                }

                if(!data.sitename) {
                    res.status(403);
                    cb(['Sitename required']);
                    return;
                }

                if(!data.refname) {
                    res.status(403);
                    cb(['Reference site name required']);
                    return;
                }

                app.db.collection('site-_root-users', function(err, col) {
                    col.find({"_id": 'admin'}).toArray(function(arr, adata) {

                        if(adata[0] && adata[0].api_key == data.key) {
                            FireRequest(
                                new Admin_CloneDbRq({app: app, data: data})
                                , function() {
                                    res.status(200);
                                    cb([null, 'Db has been cloned.'])
                                }
                                , function() {});
                        } else {
                            res.status(403);
                            cb(['Authorization required. Wrong key.']);
                        }
                    })
                });
            }));

            success();
        };
    }
    , cloneDb: function() {
        var
              request = CatchRequest(Admin_CloneDbRq)
            , app     = request.app
            , data    = request.data;

        return function(success, fail) {
            ['site-reference', 'site-reference-users', 'site-reference-plugins', 'site-reference-snapshots'].map(function(collname, i) {
                var collrefname = collname.replace('reference', data.refname);

                app.db.listCollections({name: collrefname})
                    .next(function(err, info) {
                        if(!info) {
                            console.log('[INFO] No reference site collection ' + collrefname + ' found. Nothing to do.');

                            if(i === 3) {
                                success();
                            }
                        } else {
                            app.db.collection(collrefname, function(err, scol) { // open source collection
                                app.db.createCollection(collname.replace('reference', data.sitename), function(err, dcol) { // open destination collection
                                    scol.find().toArray(function(arr, sdata) {
                                        sdata.map(function(s) {
                                            dcol.update(s, function(err, docs) {});
                                        });

                                        if(i === 3) {
                                            _createSite();
                                        }
                                    })
                                })
                            })
                        }
                    }
                );
            });

            function _createSite() {
                app.db.createCollection('_sites', function(err, scol) {
                    var crypto_key = '', hash_key = '';

                    for (var i = 0; i < 5; i++) {
                        crypto_key += Math.random().toString(32).substr(2);
                        hash_key   += Math.random().toString(32).substr(2);
                    }

                    scol.insert({_id: data.sitename, hash_key: hash_key, crypto_key: crypto_key, free_register: true, names: []}, {save: true}, function() {
                        success();
                    })
                })
            }
        }
    }
};