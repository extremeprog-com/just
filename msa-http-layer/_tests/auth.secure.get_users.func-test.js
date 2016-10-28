require('../../tests_globals.js').init();

it("return error on trying to get other users for unauthorized", function(done) {
    api_post('/api/auth/users', function (err, res) {
        assert.ifError(err);

        assert(res);
        assert.equal(res.statusCode, 403);

        assert(res.body);
        assert(res.body[0]);
        assert.equal(res.body[1], null);

        done();
    });
});

initCookie(user);

it("should return error on trying to get other users", function(done) {
    api_post('/api/auth/users', function (err, res) {
        assert.ifError(err);

        assert(res);
        assert.equal(res.statusCode, 403);

        assert(res.body);
        assert(res.body[0]);
        assert.equal(res.body[1], null);

        done();
    });
});

initCookie(false);