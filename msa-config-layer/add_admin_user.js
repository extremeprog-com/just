#!/usr/bin/env node

const prompt  = require('prompt');
const mongodb = require('mongodb');

//var params = opt.create([
//    ['h', 'help'                , 'output usage information'],
//    ['' , 'show'                , 'show all sites that already exist'],
//    ['' , 'site-name=<arg>'     , 'specify site name'],
//    ['' , 'default-admin=<arg>' , 'specify default admin email'],
//    ['' , 'domain-name=<arg>+'  , 'specify domain name'],
//    ['' , 'free-register=<arg>' , 'specify free register option for users (true|false)']
//])
//    .bindHelp()
//    .parseSystem();


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
    var mongoHost   = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mongo-sites';

    mongoClient.connect(mongoHost, function (err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server from environment variable MONGO_URL=' + mongoHost + '. Error:', err);
            setTimeout(function () {
                process.exit();
            }, 5000);
        } else {
            console.log('Connected to mongodb.');

            db.collection('_sites').find({_id: result.site_name}).toArray(function (err, site) {
                if(!site) console.error('No site with ' + site + ' name was found.');
                else db.createCollection('site-' + result.site_name + '-users', function (err, collection) {

                    collection.find({_id: result.username}).toArray(function (err, user) {

                        var new_user = { _id: result.email };

                        var hash = new crypto.Hash('MD5');
                        hash.update(data[0]._id + data[0].password + secret);
                        new_user._originated  = parseInt(new Date() / 1000);
                        new_user.passwordHash = hash.digest('base64');

                        if(!user) {
                            collection.insert(new_user, function(err, data) {
                                if(err) {
                                    cb(err);
                                }
                            })
                        }
                        db.close();
                    });

                });
            });
        }
    });

});

function onErr(err) {

}