require('../../tests_globals.js').init();

[
    {
        email: random_email(),
        password: random_password(),
        api_key: random_password()
    }
].map(function (test_data) {

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

    initCookie(false);

    it("should return OK on find request with token", function(done) {

        api_post('/api/auth/users?api_key=' + test_data.api_key + '&site=test', function (err, res) {
            assert.ifError(err);

            assert(res);
            assert.equal(res.statusCode, 200);
            assert(res.body);
            assert(res.body[0] === null);
            assert(res.body[1]);

            assert(testUserToGet = res.body[1][1]);

            done();
        });

    });



});
