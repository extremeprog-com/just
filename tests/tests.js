(function(){
    var testApp = angular.module('mongo-site-api-test', ['ngFileUpload']);
    
    var apiTest = function(scope, name, test) {
        var that = {};
        that.name = name;
        that.class = '';
        that.message = '';
        that.details = '';
        that.runInternal = test;
        that.run = function() {
            if (typeof mongoSitesApi === 'undefined') {
                that.fail('mongoSitesApi is undefined');
            } else {
                that.runInternal();
            }
        };
        that.success = function(message, data) {
            console.log(message, data);
            var details = typeof data === 'undefined' ? '' : JSON.stringify(data); 
            that.class = 'alert-success';
            that.message = message;
            that.details = details;
            scope.$apply();
        };
        that.fail = function(message, data) {
            console.error(message, data);
            var details = typeof data === 'undefined' ? '' : JSON.stringify(data); 
            that.class = 'alert-danger';
            that.message = message;
            that.details = details;
            scope.$apply();
        };
        return that;
    };
    
    function testController($scope) {
        $scope.tests = [
            apiTest($scope, 'register user for testing', function() {
                var result = '';
                var resultData = {};
                mongoSitesApi
                    .auth_register('test@gmail.com', 'pupu')
                    .then (function(data) {
                    result += 'register_ok ';
                    resultData.data1 = data;
                })
            }),
            apiTest($scope, 'find 1', function() {
                var that = this;
                mongoSitesApi.mgoInterface
                        .find({param1: 'param'})
                        .then(function(data) { that.success('ok', data); })
                        .catch(function(data) { that.fail('error', data);} );
            }),            
            apiTest($scope, 'find 2', function() {
                var that = this;
                mongoSitesApi.mgoInterface
                    .find({param1: 'param', zuku: {$werwo: 'fwe'}})
                    .then(function(data) { that.fail('error: must return error', data); })
                    .catch(function(data) { that.success('ok', data); });
            }),            
            apiTest($scope, 'aggregate', function() {
                var that = this;
                mongoSitesApi.mgoInterface
                    .aggregate({$group: {_id: 'param1', tu: {$addToSet: "$tutu"}}})
                    .then(function(data) { that.success('ok', data); })
                    .catch(function(data) { that.fail('error', data); });
            }),            
            apiTest($scope, 'insert one', function() {
                var that = this;
                mongoSitesApi.mgoInterface
                    .insert({_type: 'test1', b: {'_array:integer': [1,2,3]}, content: {_html: '<h1>ololoski</h1>'}})
                    .then(function(data) { that.success('ok', data); })
                    .catch(function(data) { that.fail('error', data); });
            }),            
            apiTest($scope, 'complex test 1(save)', function() {
                var that = this;
                var result = '';
                var resultData = {};
                mongoSitesApi
                    .save({_type: 'test2', numbers: {'_array:integer': [1,2]}, content: {_html: '<h1>ololoski</h1>'}})
                    .catch(function(data) {
                        that.fail('save_error_1', data);
                        })
                    .then(function(data) {
                        result += 'save_ok_1 ';
                        resultData.data1 = data;
                        data.ototo = 444;
                        mongoSitesApi.save(data)
                            .catch(function(data) { 
                                result += 'save_error_2 ';
                                resultData.data2 = data;
                                that.fail(result, resultData);
                                })
                            .then(function(data) {                                  
                                result += 'save_ok_2 ';
                                resultData.data2 = data;              
                                mongoSitesApi.snapshots({ _id: data._id})
                                    .catch(function(data) { 
                                        result += 'get_snapshots_error ';
                                        resultData.data3 = data;
                                        that.fail(result, resultData);
                                        })
                                    .then(function(data) {                
                                        if(data.length != 2)  {
                                            result += 'expected_2_snapshots ';
                                            resultData.data3 = data;
                                            that.fail(result, resultData);
                                        }   
                                        else {                                            
                                            result += 'ok_3 ';
                                            resultData.data3 = data;
                                        }             
                                        var first_snapshot = data.filter(function(it) {
                                            return it._originated == it._modified
                                        })[0];
                
                                        mongoSitesApi.snapshots_revert( first_snapshot._snapshot_id )
                                            .catch(function(data) {
                                                result += 'snapshot_revert_error ';
                                                resultData.data4 = data;
                                                that.fail(result, resultData);
                                                })
                                            .then(function() {
                                                mongoSitesApi.mgoInterface.findOne({_id: first_snapshot._id})
                                                    .catch(function(data) {
                                                        result += 'find_reverted_error ';
                                                        resultData.data4 = data;
                                                        that.fail(result, resultData);
                                                        })
                                                    .then(function(data) {
                                                        if(data.ololo) {
                                                            result += 'not_reverted ';
                                                            resultData.data4 = data;
                                                            that.fail(result, resultData);
                                                        } else {                                                            
                                                            result += 'revert_ok ';
                                                            resultData.data4 = data;
                                                            that.success(result, resultData);
                                                        }
                                                    })
                                            })
                                    })
                            })
                    });
            }),            
            apiTest($scope, 'complex test 2(insert)', function() {
                var that = this;
                var result = '';
                var resultData = {};
                var current_timestamp = parseInt(new Date() / 1000);
                mongoSitesApi.mgoInterface
                    .insert([ {_type: 'test1', version: current_timestamp, image: {_image: 'http://url.domain/path/to.jpg'}}, {_type: 'test2', instruction: {_file: 'http://url.domain/path/to.pdf', type: 'pdf'}, building: { _link: 'shhsu3883wywbsdq89eq892heq' }} ])
                    .then(function(data) {
                        result += 'insert_many_ok ';
                        resultData.data1 = data;
                        
                        if (data.ops === undefined) {
                            result += 'data.ops_undefined ';
                            that.fail(result, resultData);
                        } else {
                            var ops = data.ops;
                            mongoSitesApi.graph_add(ops[0]._id, ops[1]._id, 'test1_has_test2')
                                .then(function(data) {
                                    result += 'graph_add_ok ';
                                    resultData.data2 = data;                                    
                                    data.sortField = 'wrwew';
                                    mongoSitesApi.graph_update(data)
                                        .then(function() {
                                            mongoSitesApi.graph_search({role: 'test1_has_test2'})
                                                .then(function(data) {
                                                    if(data.length) {
                                                        result += 'graph_search_1_ok ';
                                                        resultData.data3 = data;
                                                        mongoSitesApi.graph_search({destination: {'instruction.type' : 'pdf'}})
                                                            .then(function(data) {
                                                                if(data.length) {
                                                                    result += 'graph_search_2_ok ';
                                                                    resultData.data4 = data;   
                                                                    mongoSitesApi.graph_add(ops[1]._id,ops[0]._id, 'test1_has_test2ss')
                                                                    .then(function(data) {
                                                                        result += 'graph_add_ok ';
                                                                        resultData.data5 = data;
                                                                        mongoSitesApi.graph_remove(data)
                                                                            .then(function(data) {
                                                                                result += 'graph_remove_ok ';
                                                                                resultData.data6 = data;
                                                                                that.success(result, resultData)
                                                                            })
                                                                            .catch(function(data) {
                                                                                result += 'graph_remove_error ';
                                                                                resultData.data6 = data;
                                                                                that.fail(result, resultData);
                                                                            });
                                                                    })
                                                                    .catch(function(data) {
                                                                        result += 'graph_add_error ';
                                                                        resultData.data5 = data;
                                                                        that.fail(result, resultData);
                                                                    });
                                                                    
                                                                } else {
                                                                    result += 'graph_search_2_error ';
                                                                    resultData.data4 = data; 
                                                                    that.fail(result, resultData);
                                                                }
                                                            });
                                                    } else {
                                                        result += 'graph_search_1_error ';
                                                        resultData.data3 = data; 
                                                        that.fail(result, resultData);
                                                    }
                                                })
                                                .catch(function(data) {
                                                    result += 'graph_search_1_error ';
                                                    resultData.data3 = data;
                                                    that.fail(result, resultData);
                                                });                                            
                                        });                    
                            })
                            .catch(function(data) {
                                result += 'graph_add_error ';
                                resultData.data2 = data;
                                that.fail(result, resultData);
                            });
                        }
                    })
                    .catch(function(data) {                        
                        result += 'insert_many_error ';
                        resultData.data1 = data;
                        that.fail(result, resultData);
                        });
            }),            
            apiTest($scope, 'update', function() {
                var that = this;
                var current_timestamp = parseInt(new Date() / 1000);
                mongoSitesApi.mgoInterface
                    .update( {_type: 'test1',  version: current_timestamp}, {$set: {title: {_string: 'true cool string'}, near: { _array: ['98huifsbd3rwefse', 's89hfwiuenfs', 'r9jfeinjr3w'], type: 'building' }}} )
                    .then(function(data) { that.success('ok', data); })
                    .catch(function(data) { that.fail('error', data); });
            }),            
            apiTest($scope, 'mapReduce', function() {
                var that = this;
                mongoSitesApi.mgoInterface
                    .mapReduce(
                        function() {
                            for(var i in this) {
                                emit(i, 1);
                            }
                        },
                        function(k, vals) {
                            return vals.reduce(function (r, it) {
                                return r + it
                            }, 0)
                        },
                        {scope: {a: 2, b: 3}})
                    .then(function(data) { that.success('ok', data) })
                    .catch(function(data) { that.fail('error', data) });
            }),            
            apiTest($scope, 'listObjectTypes', function() {
                var that = this;
                mongoSitesApi
                    .listObjectTypes()
                    .then(function(data) { that.success('ok', data) })
                    .catch(function(data) { that.fail('error', data) });
            }),            
            apiTest($scope, 'listDataTypes', function() {
                var that = this;
                mongoSitesApi
                    .listDataTypes('test2')
                    .then(function(data) { that.success('ok', data) })
                    .catch(function(data) { that.fail('error', data) });
            }),            
            apiTest($scope, 'get_aws_s3_data', function() {
                var that = this;
                mongoSitesApi
                    .get_aws_s3_data()
                    .then(function(data) { that.success('ok', data) })
                    .catch(function(data) { that.fail('error', data) });
            }),
            apiTest($scope, 'auth test 1', function() {
                var that = this;
                var result = '';
                var resultData = {};
                mongoSitesApi
                    .auth('test@gmail.com', 'pupu')
                    .then (function(data) {
                        result += 'ok ';
                        resultData.data1 = data;
                        mongoSitesApi.auth_check()
                            .then (function(data) {                                 
                                result += 'check_ok ';
                                resultData.data2 = data;
                                that.success(result, resultData) 
                                })
                            .catch(function(data) {                              
                                result += 'check_fail ';
                                resultData.data2 = data;
                                that.fail(result, resultData) 
                                });
                        })
                    .catch(function(data) {
                        result += 'error ';
                        resultData.data1 = data;
                        that.fail(result, resultData)
                        })
            }),            
            apiTest($scope, 'auth test 2', function() {
                var that = this;                
                var result = '';
                var resultData = {};
                var test_username = 'test' + Math.random().toString().substr(2);                
                mongoSitesApi
                    .auth_register({_id: test_username, password: 'testuser' })
                    .then(function(data) {
                        result += 'register_ok ';
                        resultData.data1 = data;
                        mongoSitesApi.auth_update({_id: test_username, name: '123' })
                            .then(function(data) {                                
                                result += 'update_ok ';
                                resultData.data2 = data;
                                mongoSitesApi
                                    .auth_users()
                                    .then(function(data){                         
                                        result += 'users_ok ';
                                        resultData.data3 = data;
                                        mongoSitesApi.auth_delete(test_username)
                                            .then(function(data){                    
                                                result += 'delete_ok ';
                                                resultData.data4 = data;
                                                that.success(result, resultData); 
                                                })
                                            .catch(function(data) {                  
                                                result += 'delete_error ';
                                                resultData.data4 = data;
                                                that.fail(result, resultData); 
                                                });
                                    })
                                    .catch(function(data) { 
                                        result += 'users_error ';
                                        resultData.data3 = data;
                                        that.fail(result, resultData);
                                        });
                
                            })
                            .catch(function(data) { 
                                result += 'update_error ';
                                resultData.data2 = data;
                                that.fail(result, resultData);
                                });
                
                    })
                    .catch(function(data) { 
                        result += 'register_error ';
                        resultData.data1 = data;
                        that.fail(result, resultData); 
                        });
            }),            
            apiTest($scope, 'auth test 3', function() {
                var that = this;           
                var result = '';
                var resultData = {};
                var test_update_username = 'Myau_' + Math.random().toString().substr(2);
                mongoSitesApi
                    .auth_register({_id: test_update_username, password: 'testuser' })
                    .then(function(data) {
                        result += "register[" + test_update_username + '] ';
                        resultData.data1 = data;
                        mongoSitesApi.auth_update({_id: test_update_username, name: '123' })
                            .then(function(data) {
                                mongoSitesApi.auth_users()
                                    .then(function(data) {
                                        var updated_user = data.filter(function(el) {
                                            return el._id == test_update_username;
                                        })[0];
                                        if( !updated_user || !updated_user._originated ) {
                                            result += 'update_error_missed_fields ';
                                            resultData.data2 = data;
                                            that.fail(result, resultData)
                                        } else {
                                            result += 'update_ok ';
                                            resultData.data2 = data;
                                            that.success(result, resultData);
                                        }
                                    })
                            })
                            .catch(function(data) { 
                                result += 'update_error ';
                                resultData.data2 = data;
                                that.fail(result, resultData)
                                });
                    })
                    .catch(function(data) { 
                        result += 'register_error[' + test_update_username + '] ';
                        resultData.data1 = data;
                        that.fail(result, resultData) 
                        });
            }),            
            apiTest($scope, 'auth test 4', function() {
                var that = this;
                mongoSitesApi
                    .auth_users()
                    .then(function(data){ that.success('auth_users_ok', data) })
                    .catch(function(err) { that.fail('auth_users_error', err) });
            })
        ];
        
            
        $scope.tests[0].run();
        
        function run() {
            $scope.tests.forEach(function(element, index, array) {
                element.run();
            });
        }
        run();
        $scope.run = run;
    }
    
    function testUploadController($scope, Upload) {
        $scope.upload = function($file) {
            Upload.upload({
                url: mongoSitesApi.get_upload_image_url(),
                data: {file: $file},
                withCredentials: true,
                headers: {'X-MongoApi-Site': 'test'}
            })
        };
    }
    
    testApp.controller('controller-test', testController);
    testApp.controller('controller-test-upload', testUploadController);

}());