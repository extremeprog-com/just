require('../tests_globals.js').init();

[
    {email: random_email(), password: random_password()},
    {email: random_email(), password: random_password()}
].map(function (params) {

    var auth_token;

    it('should register a new user', function (done) {
        api_post(
            '/api/users'
            , {email: params.email, password: params.password}
            , function (err, res) {
                assert.ifError(err);
                assert(res.statusCode == 200);
                assert(res.body.result);
                done()
            })
    });

    it('should sign in a user', function (done) {
        api_post(
            '/api/auth'
            , {email: params.email, password: params.password}
            , function (err, res) {
                if (err) {
                    throw err
                }
                assert(res.statusCode == 200);
                assert(res.body.result.auth_token);
                assert(res.body.result.User);
                assert(res.body.result.User.email);

                auth_token = res.body.result.auth_token;

                done();
            });
    });

    it('should return success auth status', function (done) {
        api_get(
            '/api/auth/check?auth_token=' + auth_token
            , function (err, res) {
                if (err) {
                    throw err
                }
                assert(res.statusCode == 200);
                assert(res.body.result);
                assert(res.body.result.User);
                assert(res.body.result.User.email);
                done();
            })
    });

    it('should return fail for wrong auth token', function (done) {
        api_get(
            '/api/auth/check?auth_token=' + auth_token + '1'
            , function (err, res) {
                if (err) {
                    throw err
                }
                assert(res.statusCode == 200);
                assert(res.body.result == false);
                done();
            })
    });

    it('should logout', function (done) {
        api_post(
            '/api/auth/logout?auth_token=' + auth_token
            , function (err, res) {
                if (err) {
                    throw err
                }
                assert(res.statusCode == 200);
                assert(res.body.result == true);
                done();
            })
    });

    it('should return fail auth status after logout', function (done) {
        api_get(
            '/api/auth/check?auth_token=' + auth_token
            , function (err, res) {
                if (err) {
                    throw err
                }
                assert(res.statusCode == 200);
                assert(res.body.result == false);

                done();
            });
    });
});