/**
 * @license MongoSitesAPI v0.7.0
 * (c) 2015-2016 extremeprog.com https://github.com/extremeprog-com/mongo-sites-api
 * License: MIT
 */

mongoSitesApi = (function() {

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

    return {
        _server: (typeof MSA_SERVER_URL !== 'undefined') ? MSA_SERVER_URL : '{api_url}',
        _call: function (method, data) {

            var _this = this;

            return new Promise(function (resolve, reject) {

                var xmlhttp = new XMLHttpRequest();
                xmlhttp.withCredentials = true;

                xmlhttp.open('POST', _this._server + '/api/' + method, true);

                if (location.host.match(/^(localhost|127.\d+.\d+.\d+)(:\d+)?$/) || 
                    location.protocol == 'file:') {
                    xmlhttp.setRequestHeader('X-MongoApi-Site', (typeof MSA_SITE !== 'undefined') ? MSA_SITE : '{site}')
                }

                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4) {
                        if (xmlhttp.status == 200) {
                            var response = JSON.parse(xmlhttp.responseText);
                            if (!response[0]) {
                                sortObjectKeys(response[1]);
                                resolve(response[1]);
                            } else {
                                reject(response[0]);
                                //throw new Error('mongoSitesApi error during ' + method + '(): ' + JSON.stringify(response[0]));
                            }
                        } else {
                            reject()
                        }
                    }
                };

                xmlhttp.send(JSON.stringify(data, function (key, value) {
                    switch (true) {
                        case typeof value === 'function':
                            return {__function__: value.toString()};
                            break;
                        case typeof value === 'undefined':
                            return null;
                        default:
                            return value
                    }
                }));
            })
        },
        auth: function (login, password) {
            return this._call('auth', [login, password])
        },
        mgoInterface: {
            find: function () {
                return mongoSitesApi._call('_find'     , Array.prototype.slice.call(arguments))
            },
            findOne: function () {
                return mongoSitesApi._call('_findOne'  , Array.prototype.slice.call(arguments))
            },
            aggregate: function () {
                return mongoSitesApi._call('_aggregate', Array.prototype.slice.call(arguments))
            },
            insert: function () {
                return mongoSitesApi._call('_insert'   , Array.prototype.slice.call(arguments))
            },
            update: function () {
                return mongoSitesApi._call('_update'   , Array.prototype.slice.call(arguments))
            },
            mapReduce: function () {
                return mongoSitesApi._call('_mapReduce', Array.prototype.slice.call(arguments))
            },
            remove: function (query) {
                if(JSON.stringify(query) == '{}' && !confirm("Are you really want to delete elements by empty query '{}' ?")) {
                    return new Promise(function(resolve, reject) { reject('Deleting empty array not confirmed by user') });
                }
                return mongoSitesApi._call('_remove'   , Array.prototype.slice.call(arguments))
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
                mongoSitesApi._call('save', [object]).then(function (data) {
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
                mongoSitesApi._call('graph_search', args).then(function (response) {
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
        },
        admin_sites: function() {
            return this._call('admin/sites', [])
        }
    }
})();

(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

