require('../../tests_globals.js').init();
[
    {
        email: random_email(),
        password: random_password()
    }
].map(function (test_data) {

        it("should return error for unauthorised user", function (done) {
            api_post(
                '/api/auth/change_password'
                , [{old_password: user.password, new_password: test_data.password}]
                , function (err, res) {
                    assert.ifError(err);

                    assert(res);
                    assert(res.statusCode == 401);
                    assert(res.body);
                    assert(res.body[0]);

                    done();
                }
            )
        });

        var activation_link;

        it('prepare: register a new user', function(done) {
            api_post("/api/auth/register", [{
                _id: test_data.email,
                password: test_data.password
            }], function(err, res) {
                assert.ifError(err);

                assert(res);
                assert(res.statusCode == 200);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1]);

                activation_link = res.body[1].activation_link;

                done();
            });
        });

        it('prepare: activate account using activation link', function(done) {
            api_get(activation_link, function(err, res) {
                assert.ifError(err);

                assert(res);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1]);

                done();
            });
        });

        initCookie();

        it("prepare: login", function (done) {
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

        it("should return error on wrong old password", function (done) {
            api_post(
                '/api/auth/change_password'
                , [{old_password: test_data.password + 'jajaja', new_password: test_data.password}]
                , function (err, res) {
                    assert.ifError(err);

                    assert(res);
                    assert(res.statusCode == 400);
                    assert(res.body);
                    assert(res.body[0]);

                    done();
                }
            )
        });

        it("should return error if an old password equals to a new password", function (done) {
            api_post(
                '/api/auth/change_password'
                , [{old_password: test_data.password, new_password: test_data.password}]
                , function (err, res) {
                    assert.ifError(err);

                    assert(res);
                    assert(res.statusCode == 400);
                    assert(res.body);
                    assert(res.body[0]);

                    done();
                }
            )
        });

        it("should return error on wrong new password", function (done) {
            api_post(
                '/api/auth/change_password'
                , [{old_password: test_data.password, new_password: ''}]
                , function (err, res) {
                    assert.ifError(err);

                    assert(res);
                    assert(res.statusCode == 400);
                    assert(res.body);
                    assert(res.body[0]);

                    done();
                }
            )
        });

    }
);