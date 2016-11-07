require('../../tests_globals.js').init();

[
    {
        email     : random_email(),
        password  : random_password(),
        password2 : random_password()
    }
].map(function(test_data) {

        var resetToken = '';

        it('[create user for test]', function (done) {
            create_user_for_test(test_data.email, test_data.password, function () {
                done()
            });
        });

        it("should request reset password", function(done) {
            api_post('/api/auth/request_reset_password', [{_id: test_data.email}], function(err, res) {
                assert.ifError(err);

                assert(res);
                assert(res.body);
                resetToken = res.body[1].reset_token;

                assert.equal(res.statusCode, 200);

                done();
            });
        });

        it("should reset password", function(done) {
            api_post('/api/auth/reset_password?' + resetToken, [{password: test_data.password2}], function(err, res) {
                assert.ifError(err);

                assert(res);
                assert.equal(res.statusCode, 200);

                done();
            });
        });

        it("should return error on reset password with already used link", function(done) {
            api_post('/api/auth/reset_password?' + resetToken, [{password: test_data.password2}], function(err, res) {
                assert.ifError(err);

                assert(res);
                assert.equal(res.statusCode, 400);
                assert(res.body[0]); //error

                done();
            });
        });
    }
);
