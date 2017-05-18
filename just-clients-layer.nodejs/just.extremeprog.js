/**
 * @license just v0.7.0
 *
 * (c) 2015-2016 extremeprog.com https://github.com/extremeprog-com/just
 * License: MIT
 */

var request = require('request');

var just = (function() {

    function _hmap(object, fn) {
        var dest = {};
        for(var i in object) {
            if(object.hasOwnProperty(i)) {
                dest[i] = fn(i, object[i], object)
            }
        }
        return dest
    }

    function sortObjectKeys(obj) {
        if(obj && typeof obj == 'object' && obj instanceof Object) {
            var keys = Object.keys(obj);
            keys.sort();
            keys.map(function(key) {
                var val = obj[key];
                delete obj[key];
                obj[key] = val;
            });
            keys.map(function(key) {
                if(obj[key] instanceof Object) {
                    sortObjectKeys(obj[key]);
                }
            });
        }
    }

    var jar = request.jar();

    return {
        _server: (typeof JUST_SERVER_URL !== 'undefined') ? JUST_SERVER_URL : 'https://just.extremeprog.com',
        _site: 'default',
        api_key: '',
        _call: function (method, data) {

            var _this = this;

            return new Promise(function (resolve, reject) {

                request.post({
                    url: _this._server + '/api/' + method + '?api_key=' +_this.api_key + "&site=" + _this._site,
                    json: true,
                    jar : jar,
                    body: JSON.parse(JSON.stringify(data, function (key, value) {
                        switch (true) {
                            case typeof value === 'function':
                                return {__function__: value.toString()};
                                break;
                            case typeof value === 'undefined':
                                return null;
                            default:
                                return value
                        }
                    }))
                }, function(err, res, body) {
                    var response = typeof body == 'object' ? body : JSON.parse(body);
                    if (!response[0]) {
                        sortObjectKeys(response[1]);
                        res.statusCode == 200 ? resolve(response[1]) : reject(response[1]);
                    } else {
                        reject(response[0]);
                    }
                });

                //if (location.host.match(/^(localhost|127.\d+.\d+.\d+)(:\d+)?$/) ||
                //    location.protocol == 'file:') {
                //    xmlhttp.setRequestHeader('X-MongoApi-Site', _this._site)
                //}
            })
        },
        auth: function (login, password) {
            return this._call('auth', [login, password])
        },
        mgoInterface: {
            find: function () {
                return just._call('_find'     , Array.prototype.slice.call(arguments))
            },
            findOne: function () {
                return just._call('_findOne'  , Array.prototype.slice.call(arguments))
            },
            aggregate: function () {
                return just._call('_aggregate', Array.prototype.slice.call(arguments))
            },
            insert: function () {
                return just._call('_insert'   , Array.prototype.slice.call(arguments))
            },
            update: function () {
                return just._call('_update'   , Array.prototype.slice.call(arguments))
            },
            mapReduce: function () {
                return just._call('_mapReduce', Array.prototype.slice.call(arguments))
            },
            remove: function (query) {
                if(JSON.stringify(query) == '{}' && !confirm("Are you really want to delete elements by empty query '{}' ?")) {
                    return new Promise(function(resolve, reject) { reject('Deleting empty array not confirmed by user') });
                }
                return just._call('_remove'   , Array.prototype.slice.call(arguments))
            }
        },
        listObjectTypes: function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.mgoInterface
                    .mapReduce(
                        function () {
                            if (this._type) {
                                emit(this._type, 1)
                            }
                        },
                        function (k, vals) {
                            return vals.reduce(function (r, it) {
                                return r + it
                            }, 0)
                        }
                    )
                    .then(function (data) {
                        resolve(data)
                    })
            })
        },
        listDataTypes: function (type) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.mgoInterface
                    .mapReduce(
                        function () {
                            for (var i in this) {
                                var v = this[i];
                                if (typeof v == 'object') {
                                    var _fields = [], params = {};
                                    for (var j in v) {
                                        if (j.match(/^_[^_]/)) {
                                            _fields.push(j)
                                        } else {
                                            params[j] = v[j];
                                        }
                                    }
                                    _fields.map(function (_field) {
                                        var o = {_datatype: _field};
                                        for (var k in params) {
                                            o[k] = params[k];
                                        }
                                        emit(i, {custom: [JSON.stringify(o)]})
                                    })
                                }
                            }
                        },
                        function (k, vals) {
                            return vals.reduce(function (r, it) {
                                it.custom.map(function (it) {
                                    if (r.custom.indexOf(it) == -1) {
                                        r.custom.push(it)
                                    }
                                });
                                return r;
                            }, {custom: []})
                        },
                        {
                            query: {_type: type},
                            finalize: function (k, v) {
                                v = v.custom.map(function (it) {
                                    return JSON.parse(it)
                                });
                                return v;
                            }
                        }
                    )
                    .then(function (data) {
                        resolve(data)
                    })
            })
        },
        /** @method Save object and return it in callback (with updated timestamp). Insert action report to log. */
        save: function (object) {
            return new Promise(function (resolve, reject) {
                just._call('save', [object]).then(function (data) {
                    var i;
                    for (i in data) {
                        if (data.hasOwnProperty(i)) {
                            object[i] = data[i];
                        }
                    }
                    for (i in object) {
                        if (object.hasOwnProperty(i) && !data.hasOwnProperty(i)) {
                            delete object[i];
                        }
                    }
                    sortObjectKeys(object);
                    resolve(object);
                }).catch(reject);
            })
        },
        snapshots: function (query, projection) {
            return this._call('snapshots', Array.prototype.slice.call(arguments))
        },
        snapshots_one: function(query, projection) {
            var _this = this, args = arguments;
            return new Promise(function(resolve, reject) {
                _this.snapshots.apply(_this, args)
                    .then(function(data) { resolve(data[0]) })
                    .catch(function(data) { reject(data[0]) });
            })
        },
        snapshots_revert: function (snapshot_id) {
            return this._call('snapshots/revert', Array.prototype.slice.call(arguments))
        },
        graph_add: function (source_id, destination_id, role) {
            return this.save({_type: 'link', source_id: source_id, destination_id: destination_id, role: role})
        },
        graph_update: function (linkObject) {
            var dest = {};
            _hmap(linkObject, function(i, v) {
                if(['source', 'destination'].indexOf(i) == -1) {
                    dest[i] = v;
                }
            });
            return this.save(dest)
        },
        graph_remove: function (idOrObject) {
            var _id;
            if(idOrObject instanceof Object) {
                _id = idOrObject._id
            } else {
                _id = idOrObject;
            }
            if(_id) {
                return this.mgoInterface.remove({_type: 'link', _id: _id})
            } else {
                throw new Error('Wrong _id during remove graph object')
            }
        },
        graph_search: function (query, projection, options) {
            var args = Array.prototype.slice.call(arguments);
            return new Promise(function (resolve, reject) {
                just._call('graph_search', args).then(function (response) {
                    var links = response[0];
                    var _id2object = response[1];
                    links.map(function (link) {
                        link.source = _id2object[link.source_id];
                        link.destination = _id2object[link.destination_id];
                    });
                    if (options && options.sort_field) {
                        links.sort(function (a, b) {
                            var a_sort = a[options.sort_field] || a._id,
                                b_sort = b[options.sort_field] || b._id;
                            if (a_sort > b_sort) return 1;
                            if (a_sort < b_sort) return -1;
                            return 0;
                        });
                    }
                    resolve(links)
                }).catch(reject)
            });
        },
        get_upload_image_url: function () {
            return this._server + "/api/upload_image";
        },
        get_aws_s3_data: function () {
            return this._call('s3_credentials');
        },
        auth_register: function (options) {
            return this._call('auth/register', [options]);
        },
        auth_delete: function (loginOrLogins) {
            if(typeof loginOrLogins == 'string') {
                loginOrLogins = [loginOrLogins];
            }
            if(typeof loginOrLogins == 'object' && loginOrLogins instanceof Array) {
                return this._call('auth/delete', [loginOrLogins]);
            } else {
                throw Error('Bad argument to auth_delete', loginOrLogins);
            }
        },
        auth_users: function () {
            return this._call('auth/users', []);
        },
        auth_check: function () {
            return this._call('auth/check', []);
        },
        auth_request_reset_password: function(options) {
            return this._call('auth/request_reset_password', [options])
        },
        auth_reset_password: function(options, reset_token) {
            return this._call('auth/reset_password?code=' + reset_token, [options])
        },
        auth_change_password: function(options) {
            return this._call('auth/change_password', [options]);
        },
        auth_logout: function () {
            return this._call('auth/logout', []);
        },
        auth_update: function(options) {
            return this._call('auth/update', [options])
        }
    }
})();

module.exports = just;
