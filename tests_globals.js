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
admin.password = random_password();

user.email    = random_email();
user.password  = random_password();

create_user_for_test = function(email, password, cb) {

    if(arguments[0] instanceof Function) { return create_user_for_test(random_email(), random_password(), arguments[0]); }
    if(arguments[1] instanceof Function) { return create_user_for_test(email         , random_password(), arguments[1]); }

    var user = {};

    api_post('/api/users', { email: email, password: password }, function(err, res) {
        api_post('/api/auth', { email: email, password: password }, function(err, res) {

            user.token = res.body && res.body.result && res.body.result.auth_token;
            user.User  = res.body && res.body.result && res.body.result.User;

            cb();
        });
    });

    return user
};

api_get = function(url, cb) {
    request("http://localhost:" + server_port + url, { json: true }, function(err, res, body) {
        log_resource(body, "request GET " + url + '. response ' + res.statusCode);
        cb(err, res, body);
    })
};

api_post = function(url, data, cb) {
    if(data instanceof Function) {
        cb = data;
        data = null;
    }
    request.post({url: "http://localhost:" + server_port + url, json: true, form: data }, function(err, res, body) {
        log_resource(body, "request POST " + url + ' data ' + JSON.stringify(data) + ' response ' + res.statusCode);
        cb(err, res, body);
    })
};

api_delete = function(url, data, cb) {
    if(data instanceof Function) {
        cb = data;
        data = null;
    }
    request.delete({url: "http://localhost:" + server_port + url, json: true, form: data }, function(err, res, body) {
        log_resource(body, "request DELETE " + url + ' data ' + JSON.stringify(data) + ' response ' + res.statusCode);
        cb(err, res, body);
    })
};

before(function(done) {
    //log_resource('trying to start', 'server');
    server_process = require('child_process').spawn(
        'node', ['server.js'], { env: { PORT: server_port, ADMIN_USER: admin.email, MONGO_URL: mongo_url } }
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
                api_post('/api/users', { email: admin.email, password: admin.password }, function(err, res) {
                    api_post('/api/auth', { email: admin.email, password: admin.password }, function(err, res) {

                        admin.token = res.body && res.body.result && res.body.result.auth_token;
                        admin.User  = res.body && res.body.result && res.body.result.User;

                        api_post('/api/users', { email: user.email, password: admin.password }, function(err, res) {
                            api_post('/api/auth', { email: user.email, password: admin.password }, function(err, res) {

                                user.token = res.body && res.body.result && res.body.result.auth_token;
                                user.User  = res.body && res.body.result && res.body.result.User;

                                done();
                                /* log_resource('started','server'); */
                            });
                        });
                    });
                });
            }
        })
    })();
});

after(function() {
    //log_resource('stopping', 'server');
    server_process.kill()
});

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
})(JSON.parse(fs.readFileSync('tests.json')), {});

test_filestring = function(descr) {
    var matches = new Error().stack.match(/([^/]+?\-test.js):\d+/);
    return matches[0] + (descr !== false ?  ' (' + test_descriptions[matches[1]] + ')' : '')
};

module.exports = {
    init: function() {
        if(typeof newit == 'undefined' || newit != it) {
            uit = it;

            it = newit = function(msg, cb) {
                msg = (msg ? msg + ', ' : '') + test_filestring();
                uit(msg, function(done) {
                    log_resource(msg, "test");
                    cb(done);
                });
            }
        }
    }
};

