require('core-os');

const crypto      = require('crypto');
const nodemailer  = require('nodemailer');
const transporter = nodemailer.createTransport({direct: true});
const htmlToText  = require('nodemailer-html-to-text').htmlToText;
const querystring = require("querystring");
const utils       = require("./Utils.js");

const ngcompile = require('ng-node-compile');

transporter.use('compile', htmlToText());

/** @name Auth_ResetPasswordForbidRq*/
Core.registerRequestPoint('Auth_ResetPasswordForbidRq');

/** @name Auth_ModifyUserRequest
 * Request for modification user object before responce
 * used in parse function (server.js)
 *
 */
Core.registerRequestPoint('Auth_ModifyUserRequest');

classes.Auth = {
    initAuthAPI: function() {
        var
              request = CatchRequest(MSAServer_Init)
            , app     = request.app;

        return function(success, fail) {
            app.post('/api/auth', app.parser(function (site, data, cb, user, res) {

                var collectionUsers = app.db.collection('site-' + site._id + '-users');

                collectionUsers.find({_id: data[0]}).toArray(function (err, users) {
                    if (err) {
                        cb(err);
                    } else {
                        if (users.length) {
                            if(!users[0].passwordHash) return;

                            var
                                  hash = new crypto.Hash('MD5')
                                , salt = users[0].passwordHash.split(':')[0];

                            hash.update(data[0] + data[1] + salt);

                            if(users[0].passwordHash !== salt + ':' + hash.digest('base64')) {
                                res.status(400);
                                cb('Login and password does not match');
                            } else {
                                var token = utils.encrypt(site.crypto_key, JSON.stringify({
                                    ts: new Date / 1000,
                                    user: data[0],
                                    random: Math.random().toString().substr(2) + Math.random().toString().substr(2) + Math.random().toString().substr(2) + Math.random().toString().substr(2)
                                }));

                                collectionUsers.update({_id: data[0]}, {$addToSet: {"active_sessions": token}}, function (err, response) {
                                    res.cookie(site._id + ':_auth', token, {maxAge: 365 * 24 * 3600 * 1000});
                                    cb(null, {site: site._id, token: token});
                                });
                            }
                        } else {
                            res.status(400);
                            cb('Login and password does not match');
                        }
                    }
                });
            }));

            app.post('/api/auth/logout', app.parser(null, function (req, res, site, user) {

                var collectionUsers = app.db.collection('site-' + site._id + '-users');

                if(!user) {
                    res.send([null, true]);
                    return
                }
                collectionUsers.update({_id: user._id}, {$pullAll: {"active_sessions": [ req.query.token || req.cookies[site._id + ':_auth'] ]}}, function (err, response) {
                    res.cookie(site._id + ':_auth', '  ', {maxAge: - 365 * 24 * 3600 * 1000});
                    res.send([err, true]);
                });
            }));

            app.post('/api/auth/register', app.parser(function (site, data, cb, user, res, req) {

                if (!site.free_register && !user) {
                    res.status(403);
                    cb(['Authorization required']);
                    return;
                }

                if ( !data[0]._id || !data[0].password ) {
                    res.status(400);
                    cb(['Fields _id and password required']);
                    return;
                }

                if ( data[0].admin && (!user || !user.admin) ) {
                    res.status(403);
                    cb(['Cannot register user with admin rights']);
                    return;
                }

                var re_email = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

                if( !re_email.test(data[0]._id) ) {
                    res.status(400);
                    cb(['Wrong _id']);
                    return;
                }

                var
                      hash = new crypto.Hash('MD5')
                    , salt = Math.random().toString(32).substr(2);

                hash.update(data[0]._id + data[0].password + salt);

                var new_user = data[0];

                new_user._originated  = parseInt(new Date() / 1000);
                new_user.passwordHash = salt + ':' + hash.digest('base64');

                if( user && user.admin ) {
                    new_user.active = 1;
                }

                delete new_user.password;

                var collectionUsers = app.db.collection('site-' + site._id + '-users');

                collectionUsers.findOne({_id: new_user._id}, function(err, user_exists) {
                    if(user_exists) {
                        res.status(400);
                        cb(['User with _id=' + new_user._id + ' already exists'])
                    } else {
                        collectionUsers.insert(new_user, function(err, data) {
                            if(err) {
                                cb(err);
                            } else {
                                //io.sockets.in('subscribed:all').emit('Collection_Changed', { collection: 'site-' + site._id + '-users' });

                                if(user && user.admin) {
                                    cb(null, {});
                                    return;
                                }

                                var code = site._id + ':' + utils.encrypt(site.crypto_key, JSON.stringify({
                                    date: new Date().getTime() / 1000,
                                    r: Math.random().toString().substr(2),
                                    email: new_user._id,
                                    site: site._id
                                }));

                                var link = 'http://' + req.headers.host + '/api/auth/activate?' + querystring.stringify({code: code});

                                FireRequest(new PluginUtilizer_MatchObjectRq({site: site, user: user, obj: new_user}), function(data) {

                                    var variables = {
                                        activation_link            : link,
                                        activation_code            : code,
                                        activation_code_urlencoded : require("querystring").stringify({t:code}).replace(/^t=/,''),
                                        user                       : new_user,
                                        site                       : site
                                    };

                                    // setup e-mail data with unicode symbols
                                    var mailOptions = {
                                        from    : process.env.EMAIL_FROM || 'noreply@' + (site.names && site.names[0] || site._id), // sender address
                                        to      : new_user._id, // list of receivers
                                        subject : new ngcompile().$interpolate(
                                            (data && data.register_email && data.register_email.subject) ||
                                            'Registering new user {{user._id}}'
                                        )(variables),
                                        html    : new ngcompile().$interpolate(
                                            (data && data.register_email && data.register_email.html) ||
                                            'Please activate your account by link: <a href="{{ activation_link }}">{{ activation_link }}</a>'
                                        )(variables)
                                    };

                                    var response = {};

                                    if(process.env.TEST_ENV == 'DEV_TEST') {
                                        response.activation_link = link;
                                        response.mailOptions = mailOptions;
                                    } else {
                                        // send mail with defined transport object
                                        transporter.sendMail(mailOptions, function(error, info) {
                                            if(error) {
                                                return console.log(error);
                                            }
                                            console.log('Message sent: ' + info.response);
                                        });
                                    }

                                    cb(null, response); // success
                                })
                            }
                        })
                    }
                });

            }));

            app.get('/api/auth/activate', function (req, res) {
                var code = req.query.code.split(':', 2);
                var site_id = code[0];
                code = code[1];

                app.db.collection('_sites').findOne({_id: site_id}).then(function(site) {

                    if(!site) {
                        console.error('site not found: ' + site_id, err, new Error().stack);
                        res.sendStatus(500);
                    } else {
                        try {
                            var json = utils.decrypt(site.crypto_key, code);
                            var params = JSON.parse(json);
                        } catch(e) {
                            console.error(e, e.stack, json);
                            res.sendStatus(500);
                        }

                        var collectionUsers = app.db.collection('site-' + params.site + '-users');
                        collectionUsers.update({_id: params.email}, {$set: {"active": 1}}, function (err, response) {
                            res.send([err, true]);
                        });
                    }
                }).catch(function() {
                    console.error('site not found: ' + site_id, new Error().stack);
                    res.sendStatus(500);
                });
            });

            app.post('/api/auth/users', app.parser(function (site, data, cb, user, res) {

                if (!user) {
                    res.status(403);
                    cb('Authorization required');
                    return;
                }

                var collectionUsers = app.db.collection('site-' + site._id + '-users');

                collectionUsers.find( (data && data[0]) || {} ).toArray(function(err, data) {
                    if(data && data instanceof Array) {
                        data.map(function(it) {
                            delete it.passwordHash;
                            delete it.active_sessions;
                        })
                    }
                    cb(err, data);
                });

            }));

            app.post('/api/auth/delete', app.parser(function (site, data, cb, user, res) {

                if (!user) {
                    cb('Authorization required');
                    return;
                }

                var collectionUsers = app.db.collection('site-' + site._id + '-users');

                collectionUsers.removeMany({_id: {$in: data[0]}}, function(err, data) {
                    cb(err, data);
                    if(!err) {
                        //io.sockets.in('subscribed:all').emit('Collection_Changed', { collection: 'site-' + site._id + '-users' });
                    }
                });

            }));

            app.post('/api/auth/check', app.parser(function (site, data, cb, user, res) {

                if(user) {
                    var user_to_send = JSON.parse(JSON.stringify(user));
                    delete user_to_send.passwordHash;
                    delete user_to_send.active_sessions;
                    user_to_send.login = user_to_send._id;
                }

                cb(null, user === undefined ? false : user_to_send);

            }));

            app.post('/api/auth/request_reset_password', app.parser(function(site, data, cb, user, res, req) {

                FireRequest(new Auth_ResetPasswordForbidRq({app: app, user: user, data: data, site: site, req: req}),
                    function(result) {
                        res.status(400);
                        cb(result);
                    },
                    function() {
                        make_action();
                    }
                );

                function make_action() {

                    if( !data[0]._id || !data[0]._id.trim().length ) {
                        res.status(400);
                        cb(['This user is not found in the system']);
                        return;
                    }

                    var collectionUsers = app.db.collection('site-' + site._id + '-users');

                    collectionUsers.findOne({_id: data[0]._id}, function(err, found_user) {
                        if(found_user) {

                            // generate reset password link
                            var params = {
                                date: new Date().getTime() / 1000,
                                r: Math.random().toString().substr(2),
                                email: found_user._id,
                                site: site._id
                            };
                            var code = utils.encrypt(site.crypto_key, JSON.stringify(params));
                            var reset_token = querystring.stringify({code: code});
                            var link = 'http://' + req.headers.host + '/api/auth/reset_password?' + reset_token;

                            collectionUsers.update({_id: found_user._id}, {$set: { last_reset_token: params.r }}, function() {

                                FireRequest(new PluginUtilizer_MatchObjectRq({site: site, user: user, obj: found_user}), function(data) {

                                    var variables = {
                                        reset_password_link    : link,
                                        reset_token            : code,
                                        reset_token_urlencoded : require("querystring").stringify({t:code}).replace(/^t=/,''),
                                        user                   : found_user,
                                        site                   : site
                                    };

                                    // setup e-mail data with unicode symbols
                                    var mailOptions = {
                                        from    : process.env.EMAIL_FROM || 'noreply@' + (site.names && site.names[0] || site._id), // sender address
                                        to      : found_user._id, // list of receivers
                                        subject : new ngcompile().$interpolate(
                                            (data && data.reset_password_email && data.reset_password_email.subject)
                                            || 'Reset password for user {{user._id}}'
                                        )(variables),
                                        html    : new ngcompile().$interpolate(
                                            (data && data.reset_password_email && data.reset_password_email.html)
                                            || 'Please activate your account by link:  <a href="{{ reset_password_link }}">{{ reset_password_link }}</a>' // html body
                                        )(variables)
                                    };

                                    var response = {};

                                    if(process.env.TEST_ENV == 'DEV_TEST') {
                                        response.reset_token = reset_token;
                                        response.mailOptions = mailOptions;
                                    } else {
                                        // send mail with defined transport object
                                        transporter.sendMail(mailOptions, function(error, info) {
                                            if(error) {
                                                return console.log(error);
                                            }
                                            console.log('Message sent: ' + info.response);
                                        });
                                    }

                                    cb(null, response); // success

                                });

                            });

                        } else {
                            res.status(400);
                            cb(['User with _id=' + data[0]._id + ' does not exist'])
                        }
                    });
                }
            }));

            app.post('/api/auth/reset_password', app.parser(function(site, data, cb, user, res, req) {
                try {
                    var json = utils.decrypt(site.crypto_key, req.query.code);
                    var params = JSON.parse(json);
                } catch(e) {
                    res.send(500);
                    return;
                }

                if(!data[0].password || !data[0].password.trim().length) {
                    res.status(400);
                    cb(['New password should not be empty']);
                    return;
                }

                var
                      managed_user = { _id: params.email }
                    , hash = new crypto.Hash('MD5')
                    , salt = Math.random().toString(32).substr(2);

                hash.update(managed_user._id + data[0].password + salt);
                managed_user.passwordHash = salt + ':' + hash.digest('base64');

                var collectionUsers = app.db.collection('site-' + site._id + '-users');

                collectionUsers.findOne({_id: managed_user._id, last_reset_token: params.r }, function(err, user_exists) {
                    if(user_exists) {
                        for (var i in managed_user) if (managed_user.hasOwnProperty(i) && ['_id'].indexOf(i) < 0 ) {
                            user_exists[i] = managed_user[i];
                        }
                        delete user_exists.last_reset_token;
                        collectionUsers.updateOne({_id: managed_user._id}, user_exists, function(err, data) {
                            if(err) {
                                cb(err);
                            } else {
                                //io.sockets.in('subscribed:all').emit('Collection_Changed', { collection: 'site-' + site._id + '-users' });
                                cb(null, true); // success
                            }
                        })
                    } else {
                        res.status(400);
                        cb(['Reset password is unavailable for user with _id=' + managed_user._id])
                    }
                });
            }));

            app.post('/api/auth/change_password', app.parser(function(site, data, cb, user, res, req) {

                if(!user) {
                    res.status(401);
                    res.send(['Unauthorised requests are not allowed']);
                    return;
                }

                if(!data[0].old_password || !data[0].old_password.trim().length) {
                    res.status(400);
                    cb(['Old password is required']);
                    return;
                }

                if(!data[0].new_password || !data[0].new_password.trim().length) {
                    res.status(400);
                    cb(['New password can not be empty']);
                    return;
                }

                if(data[0].new_password.trim() === data[0].old_password.trim()) {
                    res.status(400);
                    cb(['New password can not be equal to an old password']);
                    return;
                }

                var
                      old_password_hash = new crypto.Hash('MD5')
                    , salt = user.passwordHash.split(':')[0];

                old_password_hash.update(user._id + data[0].old_password + salt);

                if(salt + ':' + old_password_hash.digest('base64') !== user.passwordHash) {
                    res.status(400);
                    cb(['Old password is wrong']);
                    return;
                }

                var
                      hash = new crypto.Hash('MD5')
                    , new_salt = Math.random().toString(32).substr(2);

                hash.update(user._id + data[0].new_password + new_salt);
                var managed_user = { _id: user._id, passwordHash: new_salt + ':' + hash.digest('base64') };

                var collectionUsers = app.db.collection('site-' + site._id + '-users');

                collectionUsers.findOne({_id: managed_user._id}, function(err, user_exists) {
                    if(user_exists) {
                        for (var i in managed_user) if (managed_user.hasOwnProperty(i) && ['_id'].indexOf(i) < 0 ) {
                            user_exists[i] = managed_user[i];
                        }
                        collectionUsers.updateOne({_id: managed_user._id}, user_exists, function(err, data) {
                            if(err) {
                                cb(err);
                            } else {
                                //io.sockets.in('subscribed:all').emit('Collection_Changed', { collection: 'site-' + site._id + '-users' });
                                cb(null, true); // success
                            }
                        })
                    } else {
                        res.status(400);
                        cb(['User with _id=' + managed_user._id + ' does not exist'])
                    }
                });
            }));

            app.post('/api/auth/update', app.parser(function(site, data, cb, user, res) {
                if (!user) {
                    res.status(403);
                    cb(['Authorization required']);
                    return;
                }

                if (user._id != data[0]._id && !user.admin) {
                    res.status(400);
                    cb(['Only account owner or admin can do this']);
                    return;
                }

                if(!user.admin) {
                    delete data[0].admin;
                }

                if (!data[0]._id) {
                    cb(['Field _id is required']);
                    return;
                }

                // it's not possible to update passwordHash from the outside
                if(data[0].passwordHash) {
                    delete data[0].passwordHash;
                }

                var managed_user = data[0];
                if(managed_user.password) {
                    var
                          hash = new crypto.Hash('MD5')
                        , salt = Math.random().toString(32).substr(2);

                    hash.update(managed_user._id + managed_user.password + salt);
                    managed_user.passwordHash = salt + ':' + hash.digest('base64');

                    delete managed_user.password;
                }

                var collectionUsers = app.db.collection('site-' + site._id + '-users');

                collectionUsers.findOne({_id: managed_user._id}, function(err, user_exists) {
                    if(user_exists) {
                        for (var i in managed_user) if (managed_user.hasOwnProperty(i) && ['_id', '_originated'].indexOf(i) < 0 ) {
                            user_exists[i] = managed_user[i];
                        }

                        for(var j in user_exists) if(user_exists.hasOwnProperty(j)
                            && !managed_user.hasOwnProperty(j) && ['_id', '_originated', 'passwordHash', 'active_sessions'].indexOf(j) < 0) {
                            delete user_exists[j];
                        }

                        collectionUsers.updateOne({_id: managed_user._id}, user_exists, function(err, data) {
                            if(err) {
                                cb(err);
                            } else {
                                //io.sockets.in('subscribed:all').emit('Collection_Changed', { collection: 'site-' + site._id + '-users' });
                                cb(null, true); // success
                            }
                        })
                    } else {
                        cb(['User with _id=' + managed_user._id + ' does not exist'])
                    }
                });
            }));

            success();
        }
    }
};
