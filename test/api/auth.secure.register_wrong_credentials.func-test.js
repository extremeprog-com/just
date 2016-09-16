require('../../tests_globals.js').init();

it('should return error when trying to register with existing email', function(done) {
    api_post("/api/auth/register", [{
        _id     : user.email,
        password: user.password
    }], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.body);
        assert(res.body[0]);
        assert.equal(res.statusCode, 400);

        done();
    });
});

it('should return error when trying to register with wrong email', function(done) {
    api_post("/api/auth/register", [{
        _id     : random_title(),
        password: random_password()
    }], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.body);
        assert(res.body[0]);
        assert.equal(res.statusCode, 400);

        done();
    });
});

it('should return error when trying to register with empty password', function(done) {
    api_post("/api/auth/register", [{
        _id     : random_email(),
        password: ''
    }], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.body);
        assert(res.body[0]);
        assert.equal(res.statusCode, 400);

        done();
    });
});

