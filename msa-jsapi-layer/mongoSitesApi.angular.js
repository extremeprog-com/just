angular.module('mongoSitesApi', [])
    .service('$mongoSitesApi', function() {

        var res = {};

        function wrap(f, fname) {

            return function() {

                var result = f.apply(this, angular.copy(Array.prototype.slice.call(arguments)));
                if (result instanceof Promise) {
                    var proxy_promise = new Promise(function(resolve, reject) {
                        proxy_resolve  = resolve;
                        proxy_reject = reject;
                    }), proxy_resolve, proxy_reject, bindScopeCalled;

                    proxy_promise.bindToScope = function(scope, objectName) {
                        bindScopeCalled = true;
                        if(!scope.msa_loaded) {
                            scope.msa_loaded = {}
                        }
                        if(!scope.msa_error) {
                            scope.msa_error = {}
                        }
                        scope.msa_loaded[objectName] = false;
                        delete scope.msa_error[objectName];
                        result.then(function(data) {
                            scope.msa_loaded[objectName] = true;
                            scope[objectName] = data;
                            scope.$$phase || scope.$apply();
                            proxy_resolve(handleDataForMethod(fname, data, arguments));
                        });
                        result.catch(function(err) {
                            scope.msa_error[objectName] = err;
                            scope.$$phase || scope.$apply();
                            proxy_reject(data);
                        });
                        return result;
                    };

                    result
                        .then(function(data) { if(!bindScopeCalled) proxy_resolve(handleDataForMethod(fname, data, arguments))})
                        .catch(function(err) { if(!bindScopeCalled) proxy_reject (err)});

                    return proxy_promise;
                }
                return result;
            }
        }

        (function recurse(cursor, dcursor){
            for(var i in cursor) {
                if(cursor.hasOwnProperty(i)) {
                    if(typeof cursor[i] == 'function') {
                        dcursor[i] = wrap(cursor[i], i)
                    } else if(typeof cursor[i] == 'object') {
                        dcursor[i] = {};
                        recurse(cursor[i], dcursor[i]);
                    } else {
                        dcursor[i] = cursor[i];
                    }
                }
            }
        })(mongoSitesApi, res);

        function handleDataForMethod(method, data, object) {
            switch (method) {
                case 'save': transferDataToObjectNg(data, object[0]); return object[0];
                default: return data;
            }
        }

        function transferDataToObjectNg(data, object) {
            var i;
            for (i in data) {
                if (data.hasOwnProperty(i)) {
                    object[i] = data[i];
                }
            }
            for (i in object) {
                if (object.hasOwnProperty(i) && !data.hasOwnProperty(i) && i.match('^[^$]')) {
                    delete object[i];
                }
            }
        }

        return res
    })
    .directive('msaLoad', function () {

        function iterate(object, cb, additional_param) {
            if(typeof object == 'object') {
                for(var i in object) {
                    if(object.hasOwnProperty(i)) {
                        cb(i, object[i], additional_param)
                    }
                }
            }
        }

        return {
            restrict: 'A',
            link: function (scope, element, attr) {

                var wait_promises = {};

                (attr.msaLoad.match(/[a-z_$0-9]+(([ \t\r\n]*)\.([ \t\n]*)([a-z_$0-9]+))*([ \t\r\n]*)=/img) || []).map(function(it) {
                    var cursor = wait_promises;
                    it.replace(/[ \n\r\t=]+/g,'').split(/\./).map(function(it) { if(!cursor[it]) { cursor[it] = {} } cursor = cursor[it] })
                });

                (new Function('scope', 'wait_promises', 'with(mongoSitesApi) { with(scope) { with(wait_promises) { ' + attr.msaLoad + ' } } }'))(scope, wait_promises);

                // create or load right scope object and hack to fix placing msa_* into different scopes
                scope.msa_loaded = scope.msa_loaded || scope.$parent.msa_loaded || {};
                scope.msa_error  = scope.msa_error  || scope.$parent.msa_loaded || {};

                iterate(wait_promises, function deeper(key, value, scope_cursor) {
                    if(typeof value == 'object') {
                        if(value instanceof Promise) {
                            value.then(function(data) {
                                scope_cursor[key] = data;
                                scope.$$phase || scope.$apply()
                            });
                        } else {
                            if(!scope_cursor[key]) {
                                scope_cursor[key] = {}
                            }
                            iterate(wait_promises[key], deeper, scope_cursor[key])
                        }
                    }
                }, scope);

                iterate(wait_promises, function deeper(key, value, scope_cursor) {
                    if(typeof value == 'object') {
                        if(value instanceof Promise) {
                            delete scope_cursor[key];
                            value.then(function(data) {
                                scope_cursor[key] = true;
                                scope.$$phase || scope.$apply()
                            });
                        } else {
                            if(!scope_cursor[key]) {
                                scope_cursor[key] = {}
                            }
                            iterate(wait_promises[key], deeper, scope_cursor[key])
                        }
                    }
                }, scope.msa_loaded);

                iterate(wait_promises, function deeper(key, value, scope_cursor) {
                    if(typeof value == 'object') {
                        if(value instanceof Promise) {
                            scope_cursor[key] = null;
                            value.catch(function(data) {
                                delete scope_cursor[key];
                                scope.$$phase || scope.$apply()
                            });
                        } else {
                            if(!scope_cursor[key]) {
                                scope_cursor[key] = {};
                            }
                            iterate(wait_promises[key], deeper, scope_cursor[key])
                        }
                    }
                }, scope.msa_error);

            }
        }
    });
