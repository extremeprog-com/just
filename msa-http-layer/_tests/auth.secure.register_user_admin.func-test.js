var email      = random_email(),
    password   = random_password();

it("should return error on trying register with admin rights", function(done) {
    api_post("/api/auth/register", [{
        _id: email,
        admin: true,
        password: password
    }], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 403);

        assert(res.body);
        assert(res.body[0]);

        done();
    });
});