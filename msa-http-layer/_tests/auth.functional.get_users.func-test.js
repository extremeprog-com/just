require('../../tests_globals.js').init();

initCookie(admin);

var testUserToGet = null;

it("should get users", function(done) {
    api_post('/api/auth/users', function (err, res) {
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

it("should get particular user", function(done) {
    api_post('/api/auth/users', [{_id: testUserToGet._id}], function (err, res) {
        assert.ifError(err);

        assert(res);
        assert.equal(res.statusCode, 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);

        assert.equal(res.body[1]._id, testUserToGet._id);

        done();
    });
});

initCookie(false);