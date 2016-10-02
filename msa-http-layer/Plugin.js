require('core-os');

/** @name Plugin_ListChanged */
Core.registerEventPoint('Plugin_ListChanged');
Core.registerRequestPoint('Plugin_UpdateLocalRq');

classes.Plugin = {
    initPluginsAPI: function() {
        var
              request = CatchRequest(MSAServer_Init)
            , app     = request.app;

        var _this = this;

        return function (success, fail) {
            app.post('/api/plugins/save', app.parser(function (site, data, cb, user, res, req) {

                if (!user) {
                    res.status(401);
                    cb(['Authorization required']);
                    return;
                }

                var data = data[0];

                data._modified = parseInt(new Date() / 1000);

                if(typeof data._originated == 'undefined') data._originated = data._modified;
                if(typeof data._order == 'undefined')      data._order = new Date().getTime();

                var update_filter = data._id ? {_id: data._id} : {};

                if(!data._id) {
                    app.db.collection('site-' + site._id + '-plugins').insert(data, function(err, insertedObj) {
                        if(err) {
                            res.status(400);
                            cb([err]);
                            return;
                        }

                        FireRequest(new Plugin_UpdateLocalRq({app: app}), function() {
                            cb(null, insertedObj.ops[0]);
                            FireEvent(new Plugin_ListChanged);
                        });
                    })
                } else {
                    app.db.collection('site-' + site._id + '-plugins').update({_id: data._id}, data, {upsert: true}, function(err, updatedDocs) {

                        if(err) {
                            res.status(400);
                            cb([err]);
                            return;
                        }

                        FireRequest(new Plugin_UpdateLocalRq({app: app}), function() {
                            cb(null, data); // todo?
                            FireEvent(new Plugin_ListChanged);
                        });

                    })
                }
            }));

            app.post('/api/plugins/get', app.parser(function (site, data, cb, user, res, req) {

                    if (!user) {
                        res.status(401);
                        cb(['Authorization required']);
                        return;
                    }

                    cb(null, _this.site2plugins[site._id]);
                }
            ));

            app.post('/api/plugins/delete', app.parser(function (site, data, cb, user, res, req) {

                    if (!user) {
                        res.status(401);
                        cb(['Authorization required']);
                        return;
                    }

                    app.db.collection('site-' + site._id + '-plugins').remove({_id: data[0]._id}, function(err, numberOfRemovedDocs) {
                        if(err) {
                            res.status(400);
                            cb([err]);
                            return;
                        }

                        FireRequest(new Plugin_UpdateLocalRq({app: app}), function(success) {
                            FireEvent(new Plugin_ListChanged);
                            cb(null, numberOfRemovedDocs);
                        })
                    })
                }
            ));

            if(process.env.TEST_ENV == 'DEV_TEST') {
                app.post('/api/plugins/test', app.parser(function (site, data, cb, user, res, req) {

                    if (!user) {
                        res.status(401);
                        cb(['Authorization required']);
                        return;
                    }

                    cb(null, _this.matchRules(site._id, user, data[0]));

                }));
            }

            success();
        };
    },
    matchRules(site_id, user, obj) {
        var name2rule = {};

        function object_match(obj, pattern) {
            var result = true;
            Object.keys(pattern).map(function(key) {
                if(pattern[key] != obj[key]) {
                    result = false;
                }
            });
            return result;
        }

        this.site2plugins[site_id].map(function(plugin) {
            Object.keys(plugin).map(function(name) {
                if(plugin[name] instanceof Array) {
                    plugin[name].map(function(rule) {
                        if(object_match(user, rule[0]) && object_match(obj, rule[1])) {
                            name2rule[name] = rule[2];
                        }
                    })
                }
            })
        });
        return name2rule;
    },
    site2plugins: {},
    buildMap: function() {
        var
              request = CatchRequest(MSAServer_Init, Plugin_UpdateLocalRq)
            , app     = request.app
            , _this   = this
            ;

        return function(success, fail) {

            var pending = 0;
            app.db.listCollections().toArray(function(err, data) {
                data.map(function(it) {
                    var matches;
                    if(matches = it.name.match(/^site-(.*)-plugins$/)) {
                        pending++;
                        app.db.collection(it.name).find({}, {sort: {_order: 1}}).toArray(function(err, docs) {
                            if(err) {
                                fail();
                                return;
                            }
                            _this.site2plugins[matches[1]] = docs;
                            pending--;
                            if(!pending) {
                                success()
                            }
                        })
                    }
                });
                if(!pending) {
                    success()
                }
            });
        }
    }
};