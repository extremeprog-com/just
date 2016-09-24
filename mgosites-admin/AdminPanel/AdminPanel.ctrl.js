mgoAdmin.controller('mgoAdminPanel', function ($scope, $mongoSitesApi, $state) {
    $scope.state = {};
    $scope.state.command = "";
    $scope.state.activeDataType = "";
    $scope.state.dataTypes = [];
    $scope.state.shouldShowEditJSONModal = false;

    $scope.JSON = JSON;

    window.$scope = $scope;

    function fitMongoFilter(object, filter) {
        try {
            Object.keys(filter).map(function(key) {
                var filter_value = filter[key];

                (function check(key){
                    for(var cursor = this; key.length; key = key.slice(1)) {
                        cursor = cursor[key[0]];
                        if(cursor instanceof Array) {
                            var result = false;
                            cursor.map(function(cursor) {
                                try {
                                    check.call(cursor, key.slice(1));
                                    result = true; // found
                                } catch(e) {
                                }
                            });
                            if(!result) {
                                throw 'not found';
                            }
                            return;
                        }
                    }
                    if(cursor != filter_value) {
                        throw 'not found';
                    }
                }).call(this, key.split(/\./g));

            }, object);
            return true;
        } catch(e) {
            return false;
        }
    }

    function substitute(object, subst) {
        console.log(subst);
        var re = new RegExp("%(" + Object.keys(subst).join("|") + ")\\.([^% ,;:]+)%");
        console.log(re);
        console.log(object);
        Object.keys(object).map(function(key) {
            console.log(key, object[key]);
            if(typeof object[key] == 'string' && re.test(object[key])) {
                var m = object[key].match(re);
                if(object[key] == m[0]) {
                    object[key] = substi.apply(null, m);
                } else {
                    object[key] = object[key].replace(new RegExp(re, "g"), substi);
                }
                function substi(a,b,c) {
                    for(var cursor = subst[b], path = c.split(/\./); path.length; path = path.slice(1)) {
                        cursor = cursor[path[0]];
                    }
                    console.log(cursor);
                    return cursor;
                }
            }
            if(object[key] && typeof object[key] == 'object') {
                console.log(object[key], subst);
                substitute(object[key], subst);
            }
        });
        console.log(object);
        return object;
    }

    $scope.loadDataTypes = function () {
        $mongoSitesApi.mgoInterface.aggregate({"$group": {_id: "$_type", count: { $sum: 1 }}}).then(function (data) {
            $scope.state.dataTypes = data;
            $scope.$$phase || $scope.$apply();
        });
    };

    $scope.runRequest = function () {
        $scope.state.command.replace('mongoSitesApi', '$mongoSitesApi');
        $scope.state.objects = null;
        $scope.objects = null;
        var promise;
        eval("promise = " + $scope.state.command);
        promise.then(function (data) {
            $scope.state.objects = data;
            $scope.objects = data;
            $scope.$$phase || $scope.$apply();
        })
    };

    $scope.handleSelectDataType = function (dT) {
        $scope.state.objects = null;
        $scope.objects = null;
        $scope.state.activeDataType = dT;

        switch (dT) {
            case "Users":
                $scope.state.command = 'mongoSitesApi.auth_users()';
                break;
            default:
                var request = [{_type: dT}, {limit: 100}];
                if(objectRestrictions[dT]) {
                    console.log(objectRestrictions[dT].readFilter);
                    angular.merge(request[0], objectRestrictions[dT].readFilter);
                }
                $scope.state.command = 'mongoSitesApi.mgoInterface.find(' + request.map(JSON.stringify).join(", ") + ')';
                break;
        }
        $scope.runRequest();

        $scope.setObjectTemplates(objectTemplates[dT]);
    };

    var _currentObjTemp = null;

    $scope.setObjectTemplates = function(temp) {
        _currentObjTemp = temp;
    };

    $scope.getObjectTemplates = function() {
        return _currentObjTemp;
    };

    $scope.loadDataTypes();

    var objectRestrictions  = {};
    var objectTemplates     = {};
    var listTemplates       = {};
    var allowedObjects      = null;

    $scope.User = null;

    $mongoSitesApi.auth_check().then(function(User) {

        $scope.User = User;

        objectRestrictions  = {};
        objectTemplates     = {};
        listTemplates       = {};
        allowedObjects      = null;
        $mongoSitesApi.mgoInterface.find({_type: 'Plugin'}).then(function(data) {
            substitute(data, {user: User});
            $scope.pluginsReady = true;
            data.map(function(plugin) {
                (plugin.allowedObjects || []).map(function(allowedObjectList) {
                    if(fitMongoFilter(User, allowedObjectList.userLike) && allowedObjectList && allowedObjectList.allowedTypes && allowedObjectList.allowedTypes.length) {
                        if(!allowedObjects) {
                            allowedObjects = []
                        }
                        allowedObjectList.allowedTypes.map(function(it) {
                            if(allowedObjects.indexOf(it) == -1) {
                                allowedObjects.push(it)
                            }
                        });
                    }
                });
                $scope.allowedObjects = allowedObjects;
                console.log($scope.allowedObjects);
                $scope.$$phase || $scope.$apply();
                (plugin.objectRestrictions  || []).map(function(restriction) {
                    if(fitMongoFilter(User, restriction.userFilter)) {
                        objectRestrictions[restriction.type] = restriction;
                    }
                });
                (plugin.objectTemplates || []).map(function(template) {
                    if(!objectTemplates[template.json._type]) {
                        objectTemplates[template.json._type] = [];
                    }
                    objectTemplates[template.json._type].push({
                        _id:  template.title,
                        code: template.json
                    });
                });
                (plugin.listTemplates || []).map(function(template) {
                    if(!listTemplates[template.type]) {
                        listTemplates[template.type] = [];
                    }
                    listTemplates[template.type].push(template);
                });
                $scope.listTemplates = listTemplates;
            });
        });
    });

    //console.log(fitMongoFilter({rw: 2, kiki: {bubu: "tutu"}, dudu: ["a", "b"], kaka:22}, {"kiki.bubu": "tutu", dudu:"a"}));

    socket.on('Collection_Changed', function(data) {
        $scope.loadDataTypes();
        $scope.runRequest();
    });

    $scope.logout = function() {
        $mongoSitesApi.auth_logout().then(function() {
            $state.go("login");
        });
    }
});