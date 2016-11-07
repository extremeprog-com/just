#!/usr/bin/env node

const prompt = require('prompt');
const mongodb = require('mongodb');
const crypto = require('crypto');

prompt.message = "";

var properties = [
    {
        type: 'string',
        name: 'site_name',
        required: true,
        validator: '',
        warning: 'Wrong site_name. Please try again.'
    },
    {
        type: 'string',
        name: 'email',
        required: true,
        validator: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        warning: 'Wrong email. Please try again.'
    },
    {
        type: 'string',
        required: true,
        warning: 'Password could not be empty.',
        name: 'password',
        hidden: true
    }
];

prompt.start();

prompt.get(properties, function (err, result) {
    if (err) {
        console.log(err);
        return 1;
    }

    var mongoClient = mongodb.MongoClient;
    var mongoHost = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mongo-sites';

    mongoClient.connect(mongoHost, function (err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server from environment variable MONGO_URL=' + mongoHost + '. Error:', err);
            setTimeout(function () {
                process.exit();
            }, 5000);
        } else {
            console.log('Connected to mongodb.');

            db.collection('_sites').find({_id: result.site_name}).toArray(function (err, site) {
                    if (!site.length) {
                        console.error('No site with ' + result.site_name + ' name was found.');
                        db.close();
                    } else
                        db
                            .collection('site-' + result.site_name + '-users')
                            .find({_id: result.email}).toArray(function (err, user) {
                                if (!user.length) {
                                    var new_user = {_id: result.email};

                                    var hash = new crypto.Hash('MD5');
                                    hash.update(new_user._id + result.password + site[0].hash_key);

                                    new_user._originated = parseInt(new Date() / 1000);
                                    new_user.passwordHash = hash.digest('base64');
                                    new_user.admin = true;
                                    new_user.active = 1;

                                    db.collection('site-' + result.site_name + '-users').insert(new_user, function (err, data) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        console.log('New admin user ' + result.email +  ' was added to site ' + result.site_name + ".");
                                    })
                                } else {
                                    console.log("User with " + result.email + ' already exists.')
                                }
                                db.close();
                            });
                }
            );
        }
    });
});