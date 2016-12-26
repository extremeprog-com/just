require('core-os');
var mongodb = require('mongodb');

classes.Snapshots = {
    initSnapshotsAPI: function() {
        var
            request = CatchRequest(MSAServer_Init)
            , app     = request.app;

        return function(success, fail) {
            app.post('/api/save', app.parser(function (site, data, cb, user, res) {

                if (!user) {
                    res.status(401);
                    cb(['Authorization required']);
                    return;
                }

                if (data instanceof Array) {
                    data = data[0];
                }

                if (!data._type) {
                    res.status(400);
                    cb('Cannot save without _type');
                    return;
                }

                var collection = app.db.collection('site-' + site._id);
                var snapshots = app.db.collection('site-' + site._id + '-snapshots');

                var _id = data._id;
                delete data._id;
                delete data._snapshot_id;

                if (_id) {
                    collection.findOne({_id: _id}, function (err, result) {

                        var i, changed = false, changed_persist = false;

                        // if has found element with the _id in the collection
                        for (i in result) {
                            if (result.hasOwnProperty(i) && ['_id', '_modified'].indexOf(i) == -1) {
                                if (JSON.stringify(result[i]) != JSON.stringify(data[i])) {
                                    if (i == '_persist') {
                                        changed_persist = true;
                                    } else {
                                        changed = true;
                                    }
                                }
                            }
                        }

                        for (i in data) {
                            if (data.hasOwnProperty(i) && ['_id', '_modified'].indexOf(i) == -1) {
                                if (JSON.stringify(result[i]) != JSON.stringify(data[i])) {
                                    if (i == '_persist') {
                                        changed_persist = true;
                                    } else {
                                        changed = true;
                                    }
                                }
                            }
                        }

                        if (!changed && !changed_persist) {
                            cb(null, result);
                            return;
                        }

                        if (changed) {
                            data._modified = parseInt(new Date() / 1000);
                        }

                        collection.updateOne({_id: _id}, data, {upsert: true}, function (err1, result1) {
                            data._oid = _id;
                            data._user = user._id;

                            app.io.sockets.in('subscribed:all').emit('Collection_Changed', {collection: 'site-' + site._id});

                            delete data._persist;

                            if (changed) {
                                snapshots.update({
                                    _oid: _id,
                                    _terminated: {$exists: false}
                                }, {$set: {_terminated: data._modified}}, function (errN, resultN) {
                                    snapshots.insertOne(data, function (err2, result2) {
                                        collection.findOne({_id: _id}, function (err3, result3) {
                                            cb(err1 || err2 || err3, result3);
                                        })
                                    })
                                })
                            } else {
                                collection.findOne({_id: _id}, function (err3, result4) {
                                    cb(null, result4);
                                })
                            }
                        });
                    });
                } else {

                    data._originated = data._modified = parseInt(new Date() / 1000);

                    collection.insertOne(data, function (err1, result) {
                        _id = data._id;
                        delete data._id;

                        data._oid = _id;
                        data._user = user._id;
                        delete data._id;

                        delete data._persist;

                        snapshots.insertOne(data, function (err2, result) {
                            collection.findOne({_id: _id}, function (err3, result) {
                                cb(err1 || err2 || err3, result);
                            })
                        })
                    });
                }

            }));

            app.post('/api/snapshots', app.parser(function (site, data, cb, user) {

                if (!user) {
                    cb(['Authorization required']);
                    return;
                }

                var limit = data[2] && data[2].limit || 5;

                var snapshots = app.db.collection('site-' + site._id + '-snapshots');

                (function (data) {
                    if (data._id) {
                        data._oid = data._id;
                        delete data._id;
                    }

                    if (data._snapshot_id) {
                        data._id = data._snapshot_id;
                        delete data._snapshot_id;
                    }
                })(data[0]);

                mongodb.Collection.prototype.find.apply(snapshots, data).sort({_id: -1}).limit(limit).toArray(function (err, result) {
                    cb(err, result.map(function (it) {
                        it._snapshot_id = it._id;
                        it._id = it._oid;
                        delete it._oid;
                        return it
                    }));
                });
            }));

            app.post('/api/snapshots/revert', app.parser(function (site, data, cb, user) {

                if (!user) {
                    cb(['Authorization required']);
                    return;
                }

                var collection = app.db.collection('site-' + site._id);
                var snapshots = app.db.collection('site-' + site._id + '-snapshots');

                snapshots.findOne({_id: mongodb.ObjectId(data[0])}, function (err, result) {
                    if (err || !result) {
                        cb(err || 'no snapshot found with _snapshot_id=' + data[0]);
                        return;
                    }
                    delete result._id;
                    result._id = result._oid;
                    delete result._oid;
                    collection.findOne({_id: mongodb.ObjectId(result._id)}, function (err, old_data) {
                        if (old_data._persist) {
                            result._persist = old_data._persist;
                        }
                        collection.updateOne({_id: result._id}, result, function (err, result) {
                            if (err) {
                                cb(err);
                                return;
                            }
                            cb(null, result);
                        })
                    })
                })

            }));

            success();
        }
    }
};
