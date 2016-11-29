require('core-os');

/** @name Admin_CloneDbRq*/
Core.registerRequestPoint('Admin_CloneDbRq');

classes.Admin = {
    initAdminAPI: function() {
        var
            request = CatchRequest(MSAServer_Init)
            , app     = request.app;

        return function (success, fail) {

            app.post('/api/admin/site_create', function (req, res) {

                var data = '';

                req.setEncoding('utf8');

                req.on('data', function (chunk) {
                    data += chunk;
                });

                req.on('end', function () {
                    try {
                        handle(JSON.parse(data));
                    } catch (e) {
                        res.send([e]);
                    }
                });

                function handle(data) {

                    if(!data.api_key) {
                        res.status(403);
                        cb(['Authorization required']);
                        return;
                    }

                    if(!data.sitename) {
                        res.status(403);
                        cb(['Sitename required']);
                        return;
                    }

                    app.db.collection('site-_root-users', function(err, col) {
                        col.find({"_id": 'admin'}).toArray(function(arr, adata) {

                            if(adata[0] && adata[0].api_key == data.api_key) {

                                var params = {
                                    options: {
                                        "site-name": data.sitename
                                    }
                                };

                                var crypto_key = '', hash_key = '';

                                for (var i = 0; i < 5; i++) {
                                    crypto_key    += Math.random().toString(32).substr(2);
                                    hash_key      += Math.random().toString(32).substr(2);
                                }

                                app.db.createCollection('_sites', function (err, collection) {

                                    collection.findOne({"_id": params.options['site-name']}).then(function (site_to_update) {

                                        site_to_update = site_to_update || {"_id": params.options['site-name']};

                                        //site_to_update.hash_key   = site_to_update ? site_to_update.hash_key   || hash_key   : hash_key;
                                        site_to_update.crypto_key = site_to_update ? site_to_update.crypto_key || crypto_key : crypto_key;
                                        site_to_update.free_register = data.free_register ? true : false;
                                        site_to_update.names = data.names;

                                        collection.update(
                                            {"_id": params.options['site-name']},
                                            site_to_update,
                                            {upsert: true},
                                            function () {

                                                if (!err) console.log('Collection _sites created. Site ' + params.options['site-name'] + ' added.');
                                                else console.log('Failed to create _sites collection.', err);

                                                app.db.createCollection('site-' + params.options['site-name'], function (err, collection) {
                                                    if (!err) console.log('Collection site-' + params.options['site-name'] + ' created.');
                                                    else console.log('Failed to create site-' + params.options['site-name'] + 'collection.', err);

                                                    app.db.createCollection('site-' + params.options['site-name'] + '-users', function (err, collection) {
                                                        if (!err) console.log('Collection site-' + params.options['site-name'] + '-users created.');
                                                        else console.log('Failed to create site-' + params.options['site-name'] + '-users collection.', err);

                                                        app.db.createCollection('site-' + params.options['site-name'] + '-plugins', function (err, collection) {
                                                            if (!err) console.log('Collection site-' + params.options['site-name'] + '-plugins created.');
                                                            else console.log('Failed to create site-' + params.options['site-name'] + '-plugins collection.', err);

                                                            res.json([null, true]);

                                                        });
                                                    });
                                                });
                                            }
                                        );
                                    });

                                });

                            } else {
                                res.status(403);
                                cb(['Authorization required. Wrong key.']);
                            }
                        })
                    });

                }

            });

            app.post('/api/admin/site_clone', function (req, res) {

                function cb(data) {
                    res.json(data);
                }

                var data = '';

                req.setEncoding('utf8');

                req.on('data', function (chunk) {
                    data += chunk;
                });

                req.on('end', function () {
                    try {
                        handle(JSON.parse(data));
                    } catch (e) {
                        res.send([e]);
                    }
                });

                function handle(data) {
                    if(!data.api_key) {
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

                            if(adata[0] && adata[0].api_key == data.api_key) {
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

                }


            });

            app.get('/api/admin/sites', function(req, res) {
                var sites = Object.keys(req.cookies)
                    .filter(function(it) { return it.match(/:_auth$/) })
                    .map(function(it) { return it.match(/^(.+):_auth$/)[1] })
                    .map(function(site_id) {
                        return {_id: site_id}
                    });
                res.json([null, sites]);
            });

            success();
        };
    },
    createRootSiteIfNeed: function() {
        var
            request = CatchRequest(MSAServer_Init)
            , app     = request.app;

        return function (success, fail) {

            var params = {
                options: {
                    "site-name": "_root"
                }
            };

            var site_to_update = {"_id": params.options['site-name']};

            var crypto_key = '', hash_key = '', admin_api_key = '';

            for (var i = 0; i < 5; i++) {
                crypto_key    += Math.random().toString(32).substr(2);
                hash_key      += Math.random().toString(32).substr(2);
                admin_api_key += Math.random().toString(32).substr(2);
                admin_api_key += Math.random().toString(32).substr(2);
            }

            app.db.createCollection('_sites', function (err, collection) {

                collection.find({"_id": params.options['site-name']}).toArray(function (err, sites) {
                    site_to_update.hash_key   = sites[0] ? sites[0].hash_key   || hash_key   : hash_key;
                    site_to_update.crypto_key = sites[0] ? sites[0].crypto_key || crypto_key : crypto_key;

                    collection.update(
                        {"_id": params.options['site-name']},
                        site_to_update,
                        {upsert: true},
                        function () {
                            if (!err) console.log('Collection _sites created. Site ' + params.options['site-name'] + ' added.');
                            else console.log('Failed to create _sites collection.', err);

                            app.db.createCollection('site-' + params.options['site-name'], function (err, collection) {
                                if (!err) console.log('Collection site-' + params.options['site-name'] + ' created.');
                                else console.log('Failed to create site-' + params.options['site-name'] + 'collection.', err);

                                app.db.createCollection('site-' + params.options['site-name'] + '-users', function (err, collection) {
                                    if (!err) console.log('Collection site-' + params.options['site-name'] + '-users created.');
                                    else console.log('Failed to create site-' + params.options['site-name'] + '-users collection.', err);

                                    app.db.createCollection('site-' + params.options['site-name'] + '-plugins', function (err, collection) {
                                        if (!err) console.log('Collection site-' + params.options['site-name'] + '-plugins created.');
                                        else console.log('Failed to create site-' + params.options['site-name'] + '-plugins collection.', err);

                                        app.db.collection('site-_root-users', function(err, col) {
                                            col.insert({
                                                "_id": 'admin',
                                                api_key: admin_api_key
                                            }).then(function() {
                                                success();
                                            }).catch(function() {
                                                success();
                                            })
                                        });

                                    });
                                });
                            });
                        }
                    );
                });

            });

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

                    scol.insert({_id: data.sitename /*, hash_key: hash_key*/, crypto_key: crypto_key, free_register: true, names: []}, {save: true}, function() {
                        success();
                    })
                })
            }
        }
    }
};