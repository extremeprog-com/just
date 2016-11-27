require('core-os');

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

                ['site-reference', 'site-reference-users', 'site-reference-plugins', 'site-reference-snapshots'].map(function(collname, i) {
                    var collname = collname.replace('reference', data.refname);

                    app.db.listCollections({name: collname})
                        .next(function(err, info) {
                            if(!info) {
                                console.log('[INFO] No reference site collection ' + collname + ' found. Nothing to do.');
                            } else {
                                app.db.collection(collname, function(err, scol) { // open source collection
                                    app.db.collection(collname.replace('reference', data.sitename), function(err, dcol) { // open destination collection
                                        scol.find().toArray(function(arr, sdata) {
                                            dcol.insert(sdata, {save: true}, function(err, docs) {});

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
                            res.status(200);
                            cb([null, 'Db has been cloned.'])
                        })
                    })
                }

            }));

            success();
        };
    }
};