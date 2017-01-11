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
                assert.equal(res.statusCode, 200);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1]);

                activation_link = res.body[1].activation_link;

                done();
            });
        });

        it('should return error when verify wrong email', function(done) {
            request(activation_link.substr(0, 52), function(err, res) {
                assert.ifError(err);

                assert(res);
                assert.equal(res.statusCode, 500);
                assert(res.body);
                done();
            });
        });

    });
