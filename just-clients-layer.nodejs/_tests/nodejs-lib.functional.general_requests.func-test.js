require('../../tests_globals.js').init();

var just = require('../just.extremeprog.js');
just._site = 'test';
just._server = "http://localhost:" + server_port;

[
    {
        email: random_email(),
        password: random_password(),
        api_key: random_password()
    }
].map(function (test_data) {

        just.api_key = test_data.api_key;

        var new_user;

        it('[create user for test]', function(done) {
            new_user = create_user_for_test(test_data.email, test_data.password, function() { done() });
        });

        it("[login with the new user]", function (done) {
            api_post('/api/auth', [test_data.email, test_data.password], function (err, res) {
                assert.ifError(err);
                assert(res);
                assert.equal(res.statusCode, 200);
                done();
            })
        });

        it("create and save api_key", function(done) {

            api_post('/api/auth/update', [{_id: test_data.email, api_key: test_data.api_key }], function (err, res) {
                assert.ifError(err);

                assert(res);
                assert.equal(res.statusCode, 200);

                done();
            });

        });

        it("should return OK on authorized request with api_key", function(done) {
            just.auth_check().then(function(result) {
                assert(result);
                assert(result._id, test_data.email);
                done()
            })
        });

        it("should return OK on saving object to db", function(done) {
            just.save({_type: random_word(), field1: random_word()}).then(function(result) {
                assert(result);
                assert(result._id, test_data.email);
                done()
            })

        });

    });

