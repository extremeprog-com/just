require('../../tests_globals.js').init();

[
    {
        email: random_email(),
        password: random_password(),
        customfield: random_title()
    }
].map(function (test_data) {

        it('[create user for test]', function (done) {
            create_user_for_test(test_data.email, test_data.password, function (generated_user) {
                initCookie(generated_user);
                done()
            });
        });

        it("should update user data", function (done) {
            api_post('/api/auth/update', [{_id: test_data.email, aaa: test_data.customfield, test: []}], function (err, res) {
                assert.ifError(err);

                assert(res);
                assert.equal(res.statusCode, 200);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1]);

                done();
            });
        });

        it("should get updated user", function(done) {
            api_post('/api/auth/users', [{_id: test_data.email}], function(err, res) {
                assert.ifError(err);

                assert(res);
                assert.equal(res.statusCode, 200);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1]);

                assert.equal(res.body[1].aaa, test_data.customfield);

                done();
            })
        });

        it("should update user data:delete some fields", function (done) {
            api_post('/api/auth/update', [{_id: test_data.email, bbb: 111}], function (err, res) {
                assert.ifError(err);

                assert(res);
                assert.equal(res.statusCode, 200);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1]);

                done();
            });
        });

        it("should get updated user without removed field", function(done) {
            api_post('/api/auth/users', [{_id: test_data.email}], function(err, res) {
                assert.ifError(err);

                assert(res);
                assert.equal(res.statusCode, 200);
                assert(res.body);
                assert(res.body[0] === null);
                assert(res.body[1]);

                assert.equal(res.body[1].bbb, 111);
                assert.equal(res.body[1].aaa, null);

                done();
            })
        });

        initCookie();

    }
);
