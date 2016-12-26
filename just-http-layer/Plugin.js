require('core-os');

var fs = require('fs');

/** @name Plugin_ListChanged */
Core.registerEventPoint('Plugin_ListChanged');
Core.registerRequestPoint('Plugin_UpdateLocalRq');
Core.registerRequestPoint('PluginUtilizer_MatchObjectRq');

classes.Plugin = {
    initPluginsAPI: function() {
        var
              request = CatchRequest(MSAServer_Init)
            , app     = request.app;

        var _this = this;

        return function (success, fail) {
            app.post('/api/plugins/save', app.parser(function (site, data, cb, user, res, req) {

                if (!user) {
                    res.status(403);
                    cb(['Authorization required']);
                    return;
                }

                var data = data[0];

                data._modified = parseInt(new Date() / 1000);

                if(typeof data._originated == 'undefined') data._originated = data._modified;
                if(typeof data._order == 'undefined')      data._order = new Date().getTime();

                var update_filter = data._id ? {_id: data._id} : {};

                FireRequest(new PluginUtilizer_MatchObjectRq({
                    site: site,
                    user: user,
                    obj : data
                }), function(restrictions_new) {

                    if (!restrictions_new.write_plugin) {
                        res.status(403);
                        cb('Update plugin denied.');
                        process.env.TEST_ENV == 'DEV_TEST' && console.error('Update plugin denied.', new Error().stack);
                        return;
                    }

                    if (!data._id) {
                        app.db.collection('site-' + site._id + '-plugins').insert(data, function (err, insertedObj) {
                            if (err) {
                                res.status(403);
                                cb([err]);
                                return;
                            }

                            FireRequest(new Plugin_UpdateLocalRq({app: app}), function () {
                                cb(null, insertedObj.ops[0]);
                                FireEvent(new Plugin_ListChanged);
                            });
                        })
                    } else {
                        app.db.collection('site-' + site._id + '-plugins').findOne({_id: data._id}, function (err, old) {
                            FireRequest(new PluginUtilizer_MatchObjectRq({
                                site: site,
                                user: user,
                                obj : old
                            }), function (restrictions_existing) {

                                if (!restrictions_existing.write_plugin) {
                                    res.status(403);
                                    cb('Update plugin denied.');
                                    process.env.TEST_ENV == 'DEV_TEST' && console.error('Update plugin denied.', new Error().stack);
                                    return;
                                }

                                app.db.collection('site-' + site._id + '-plugins').update({_id: data._id}, data, {upsert: true}, function (err, updatedDocs) {

                                    if (err) {
                                        res.status(400);
                                        cb([err]);
                                        return;
                                    }

                                    FireRequest(new Plugin_UpdateLocalRq({app: app}), function () {
                                        cb(null, data); // todo?
                                        FireEvent(new Plugin_ListChanged);
                                    });

                                });
                            });
                        });
                    }
                })
            }));

            app.post('/api/plugins/get', app.parser(function (site, data, cb, user, res, req) {

                    if (!user || !user.admin) {
                        res.status(403);
                        cb(['Authorization required']);
                        return;
                    }

                    cb(null, _this.site2plugins[site._id]);
                }
            ));

            app.post('/api/plugins/delete', app.parser(function (site, data, cb, user, res, req) {

                    if (!user || !user.admin) {
                        res.status(403);
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
                        res.status(403);
                        cb(['Authorization required']);
                        return;
                    }

                    FireRequest(new PluginUtilizer_MatchObjectRq({
                        site: site,
                        user: user,
                        obj : data[0]
                    }), function(data) {
                        cb(null, data);
                    })

                }));
            }

            success();
        };
    },
    matchRules: function() {
        var request = CatchRequest(PluginUtilizer_MatchObjectRq);

        var site_id = request.site._id,
            user    = request.user,
            obj     = request.obj,
            _this   = this
        ;

        return function(success, fail) {
            var name2rule = {};

            function object_match(obj, pattern) {

                if(typeof obj != 'object' && pattern != 'object') {
                    return (obj || {}) + '' == (pattern || {}) + '';
                }

                var result = true;
                Object.keys(pattern || {}).map(function(key) {
                    if(pattern[key] != (obj || {})[key]) {
                        result = false;
                    }
                });
                return result;
            }

            function merge(result, add) {
                if(typeof add != 'object') {
                    return add;
                }
                if(typeof result != 'object') {
                    result = {}
                }
                Object.keys(add).map(function(key) {
                    result[key] = merge(result[key], add[key]);
                });
                return result;
            }

            (_this.site2plugins[site_id] || []).map(function(plugin) {
                Object.keys(plugin).map(function(name) {
                    if(plugin[name] instanceof Array) {
                        plugin[name].map(function(rule) {
                            if(object_match(user, rule[0]) && object_match(obj, rule[1])) {
                                name2rule[name] = merge(name2rule[name], rule[2]);
                            }
                        })
                    }
                })
            });

            success(name2rule);
        }
    },
    site2plugins: {},
    filePlugins: {},
    buildMap: function() {
        var
              request = CatchRequest(MSAServer_Init, Plugin_UpdateLocalRq)
            , app     = request.app
            , _this   = this
            ;

        return function(success, fail) {
            if(request instanceof MSAServer_Init) {
                fs.readdirSync('plugins').map(function(site_id) {
                    if(fs.statSync('plugins/' + site_id).isDirectory()) {
                        _this.filePlugins[site_id] = [];

                        fs.readdirSync('plugins/' + site_id).map(function(file) {
                            if(file.match(/\.json$/)) {
                                try {
                                    var plugin = JSON.parse(fs.readFileSync('plugins/' + site_id + '/' + file));

                                    (function recursivelyLoadFiles(obj) {
                                        Object.keys(obj).map(function(key) {
                                            if(typeof obj[key] == 'string' && obj[key] && ['.', '..'].indexOf(obj[key]) == -1) {
                                                if(fs.existsSync('plugins/' + site_id + '/' + obj[key])) {
                                                    obj[key] = fs.readFileSync('plugins/' + site_id + '/' + obj[key]).toString();
                                                }
                                            }
                                            if(typeof obj[key] == 'object') {
                                                recursivelyLoadFiles(obj[key]);
                                            }
                                        })
                                    })(plugin);

                                    _this.filePlugins[site_id].push(plugin);
                                } catch(e) {
                                    console.log('Cannot load plugin plugins/' + site_id + '/' + file + ': ' + e);
                                }
                            }
                        })
                    }
                })
            }

            _this.site2plugins = {};

            (function copy(to, from) {
                Object.keys(from).map(function(key) {
                    if(typeof from[key] == 'object') {
                        if(typeof to[key] != 'object') {
                            to[key] = from[key] instanceof Array ? [] : {};
                        }
                        copy(to[key], from[key])
                    } else {
                        to[key] = from[key];
                    }
                })
            })(_this.site2plugins, _this.filePlugins);

            var pending = 0;
            app.db.listCollections().toArray(function(err, data) {
                data.map(function(it) {
                    var matches;
                    if(matches = it.name.match(/^site-(.*)$/)) {
                        if(it.name.match(/-(plugins|users)$/)) {
                            return
                        }

                        pending++;
                        app.db.collection(it.name + '-plugins').find({}, {sort: {_order: 1}}).toArray(function(err, docs) {
                            if(err) {
                                fail();
                                return;
                            }
                            _this.site2plugins[matches[1]] = [].concat(_this.site2plugins[matches[1]] || []).concat(_this.site2plugins._default || []).concat(docs);
                            pending--;
                            if(!pending) {
                                success();
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