require('../../tests_globals.js').init();

[
    {
        email: random_email(),
        password: random_password(),
        password2: random_password()
    }
].map(function (test_data) {
    
    it('[create user for test]', function(done) {
        create_user_for_test(test_data.email, test_data.password, function() { done() });
    });

    it("should login with an existing user", function (done) {
        api_post('/api/auth', [test_data.email, test_data.password], function (err, res) {
            assert.ifError(err);

            assert(res);
            assert(res.statusCode == 200);
            assert(res.body);
            assert(res.body[0] === null);
            assert(res.body[1]);

            done();
        })
    });

    it("should change password", function (done) {
        api_post(
            '/api/auth/change_password'
            , [{old_password: test_data.password, new_password: test_data.password2}]
            , function (err, res) {
                assert.ifError(err);

                assert(res);
                assert(res.statusCode == 200);
                assert(res.body);
                assert(res.body[0] === null);

                done();
            }
        )
    });

    it("should logout", function (done) {
        api_post('/api/auth/logout', [], function(err, res) {
            assert.ifError(err);

            assert(res);
            assert(res.statusCode == 200);
            assert(res.body);
            assert(res.body[0] === null);
            assert(res.body[1]);

            done();
        })
    });

    it("should return error on trying to login with old password", function (done) {
        api_post('/api/auth', [test_data.email, test_data.password], function (err, res) {
            assert.ifError(err);

            assert(res);
            assert.equal(res.statusCode, 400);
            assert(res.body);
            assert(res.body[0]);

            done();
        })
    });

    it("should return success on trying to login with new password", function (done) {
        api_post('/api/auth', [test_data.email, test_data.password2], function (err, res) {
            assert.ifError(err);

            assert(res);
            assert(res.statusCode == 200);
            assert(res.body);
            assert(res.body[0] === null);
            assert(res.body[1]);

            done();
        })
    });

});