require('../../tests_globals.js').init();

[
    {
        email: random_email(),
        password: random_password()
    }
].map(function(test_data) {
        var activation_link;

        it('should register a new user', function(done) {
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

        it('should activate account using activation link', function(done) {
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

        it('should login', function(done) {
            api_post('/api/auth', [test_data.email, test_data.password], function(err, res) {
                assert.ifError(err);

                assert(res);
                assert(res.statusCode == 200);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1]);

                done();
            })
        });

        it('should get user on check', function(done) {
            api_post('/api/auth/check', [], function(err, res) {
                assert.ifError(err);

                assert(res);
                assert(res.statusCode == 200);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1]);
                assert(res.body[1]._id   == test_data.email);
                assert(res.body[1].login == test_data.email);

                done();
            })
        });

        it('should logout', function(done) {
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

        it('should return check fail after logout', function(done) {
            api_post('/api/auth/check', [], function(err, res) {
                assert.ifError(err);

                assert(res);
                assert(res.statusCode == 200);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1] == false);

                done();
            })
        });

        initCookie(false);

    });

