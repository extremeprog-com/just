require('../../tests_globals.js').init();

[
    {
        email: random_email(),
        password: random_password()
    }
].map(function (test_data) {
        initCookie();

        it("should login with an existing user", function (done) {
            api_post('/api/auth', [user.email, user.password], function (err, res) {
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
                , [{old_password: user.password, new_password: test_data.password}]
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
            api_post('/api/auth', [user.email, user.password], function (err, res) {
                assert.ifError(err);

                assert(res);
                assert.equal(res.statusCode, 400);
                assert(res.body);
                assert(res.body[0]);

                done();
            })
        });

        it("should return success on trying to login with new password", function (done) {
            api_post('/api/auth', [user.email, test_data.password], function (err, res) {
                assert.ifError(err);

                assert(res);
                assert(res.statusCode == 200);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1]);

                done();
            })
        });

        initCookie(false);
    }
);