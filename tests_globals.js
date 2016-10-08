assert = require('assert');
request = require('request');

random_email = function() {
    return Math.random().toString().substr(2) + '@test.tld';
};

random_password = function() {
    return Math.random().toString(36).substr(2);
};

random_date = function() {
    var date = new Date(new Date().getTime() - (365 * 24 * 3600 * 1000) + parseInt(Math.random() * (365 * 24 * 3600 * 1000)));
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
};

random_time = function() {
    return parseInt(Math.random() * 24) * 100 + parseInt(Math.random() * 60);
};

random_title = function() {
    return Math.random().toString(32).substr(2);
};

merge_data = function(destination, source, fields) {
    if(!fields) {
        fields = Object.keys(source);
    }
    fields.map(function(field) {
        destination[field] = source[field]
    });
    if(arguments[3]) {
        var next_args = [].concat(arguments);
        next_args.splice(1,2);
        merge_data.apply(null, next_args);
    }
    return destination;
};


server_process = null;
server_port = 64000 + parseInt(Math.random() * 1535);
mongo_url = 'mongodb://localhost:27017/mongo-sites';

user  = {};
admin = {};

admin.email     = random_email();
admin.password  = random_password();

user.email      = random_email();
user.password   = random_password();

create_user_for_test = function(email, password, cb) {

    if(arguments[0] instanceof Function) { return create_user_for_test(random_email(), random_password(), arguments[0]); }
    if(arguments[1] instanceof Function) { return create_user_for_test(email         , random_password(), arguments[1]); }

    var user = {};
    jar = request.jar();

    api_post('/api/auth/register', [{ _id: email, password: password, admin: email == admin.email }], function(err, res) {
        api_post(res.body[1].activation_link, function(err, res) {

            api_post('/api/auth', [email, password], function(err, res) {

                //user.token = res.body && res.body.result && res.body.result.auth_token;
                user.jar = jar;

                cb(user);
            });
        });
    });

    return user;
};

var headers = {
    'Referer': "http://localhost:" + server_port,
    'X-MongoApi-Site': 'test'
};

jar = false;

initCookie = function(User, opt_use_it) {

    ((opt_use_it || typeof opt_use_it === 'undefined') && uit)
        ? uit(User ? '[init cookie with ' + (User.email == admin.email ? 'admin' : 'user') + ']' : (User === false ? '[disable cookie]' : '[create empty cookie]'), i)
        : i();

    function i() {
        if(User === false) {
            jar = false;
        } else if(User === true || typeof User === 'undefined') {
            jar = request.jar();
        } else {
            jar = User.jar;
        }
    }
};

api_get = function(url, cb) {
    if(!url.match(/^https?:\/\//)) url = "http://localhost:" + server_port + url;
    log_resource(url, "request GET ");
    request.get({url: url, json: true, headers: headers, jar : jar || request.jar() }, function(err, res, body) {
        log_resource(body, "response for GET " + url + '. is ' + res.statusCode);
        cb(err, res, body);
    })
};

api_post = function(url, data, cb) {
    if(!url.match(/^https?:\/\//)) url = "http://localhost:" + server_port + url;
    if(data instanceof Function) {
        cb = data;
        data = null;
    }
    log_resource(url + ' data ' + JSON.stringify(data), "request POST ");
    request.post({url: url, json: true, headers: headers, jar : jar || request.jar(), body: data }, function(err, res, body) {
        log_resource(body, "response for POST " + url + ' data ' + JSON.stringify(data) + ' is ' + res.statusCode);
        cb(err, res, body);
    })
};

api_delete = function(url, data, cb) {
    if(!url.match(/^https?:\/\//)) url = "http://localhost:" + server_port + url;
    if(data instanceof Function) {
        cb = data;
        data = null;
    }
    log_resource(url + ' data ' + JSON.stringify(data), "request DELETE ");
    request.delete({url: url, json: true, headers: headers, jar : jar || request.jar(), body: data }, function(err, res, body) {
        log_resource(body, "response for DELETE " + url + ' data ' + JSON.stringify(data) + ' is ' + res.statusCode);
        cb(err, res, body);
    })
};

restart_server = function() {
    uit('[restart server]', function(done) {
        stop_server(function() {
            start_server(function() {
                done()
            })
        });
    });
};

start_server = function(cb) {
    //log_resource('trying to start', 'server');
    server_process = require('child_process').spawn(
        'node', ['msa-http-layer/server.js'], { env: { TEST_ENV: 'DEV_TEST', PATH: process.env.PATH, PORT: server_port, ADMIN_USER: admin.email, MONGO_URL: mongo_url } }
    );
    server_process.stdout.on('data', function(chunk) {
        log_resource(chunk.toString(), "server's stdout");
    });
    server_process.stderr.on('data', function(chunk) {
        log_resource(chunk.toString(), "server's stderr");
    });
    (function waitServer() {
        request("http://localhost:" + server_port + "/", function(err) {
            if (err) {
                waitServer()
            } else {
                cb()
            }
        })
    })();
};

stop_server = function(cb) {
    server_process.kill();
    setTimeout(function() {
        if(server_process.kill(0)) {
            stop_server(cb);
        } else {
            cb && cb();
        }
    }, 20)
};

process.on('exit', function() {
    stop_server();
});

before(function(done) {
    //log_resource('trying to start', 'server');
    server_process = require('child_process').spawn(
        'node', ['msa-http-layer/server.js'], { env: { TEST_ENV: 'DEV_TEST', PATH: process.env.PATH, PORT: server_port, ADMIN_USER: admin.email, MONGO_URL: mongo_url } }
    );
    server_process.stdout.on('data', function(chunk) {
        log_resource(chunk.toString(), "server's stdout");
    });
    server_process.stderr.on('data', function(chunk) {
        log_resource(chunk.toString(), "server's stderr");
    });
    (function waitServer() {
        request("http://localhost:" + server_port + "/", function(err) {
            if (err) {
                waitServer()
            } else {
                create_user_for_test(admin.email, admin.password, function(created_user) {
                    //admin.token = created_user.token;
                    admin.jar   = created_user.jar;

                    create_user_for_test(user.email, user.password, function(created_user) {
                        //user.token = created_user.token;
                        user.jar   = created_user.jar;

                        done();
                    });
                });
            }
        })
    })();
});

//after(function() {
//    //log_resource('stopping', 'server');
//    server_process.kill()
//});

var fs = require('fs');
var logged_resources = [];

fs.existsSync('tests_debug.log') && fs.unlinkSync('tests_debug.log');

log_resource = function(value, name) {
    name = name || ('resource.log() ' + test_filestring() + ': ');
    logged_resources.unshift("[" + new Date().toString() + "] " + (name ? name + ' ': "") + JSON.stringify(value));
    fs.writeFileSync('tests_debug.log', logged_resources.join("\n"));
};

resource = {
    log: log_resource
};

var tests = require('./tests_scenarios.js');
var test_descriptions = (function iterate_descriptions(base, result, text) {
    if(base instanceof Array) {
        for(var i = 0; i < base.length; i++) {
            var matches = base[i].match(/^(unit|func|e2e)\s+([^:\s]+)\s*:\s*(.+)$/);
            var type = matches[1];
            var filename =  matches[2] + '.' + type + '-test.js';
            var description = matches[3];
            result[filename] = text + ' -> Scenario: ' + description;
        }
    } else {
        Object.keys(base).map(function(key) {
            iterate_descriptions(base[key], result, (text ? text + ' -> ' : '' ) + key)
        })
    }
    return result;
})(tests, {});

test_filestring = function(descr) {
    var matches = new Error().stack.match(/(.+?\-test.js):\d+/);
    return matches[0] + (descr !== false ?  ' (' + test_descriptions[matches[1]] + ')' : '')
};

module.exports = {
    init: function() {
        if(typeof newit == 'undefined' || newit != it) {
            jar = false;
            uit = it;

            it = newit = function(msg, cb) {
                msg = (msg ? msg + ', ' : '') + test_filestring();
                uit(msg, function(done) {
                    log_resource(msg, "test");
                    cb(done);
                });
            };
            initCookie(false, false);
        }
    }
};

