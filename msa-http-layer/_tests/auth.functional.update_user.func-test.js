require('../../tests_globals.js').init();

[
  {
    email: random_email(),
    password: random_password()
  }
].map(function (test_data) {

  it('[create user for test]', function(done) {
    create_user_for_test(test_data.email, test_data.password, function(generated_user) {
      initCookie(generated_user);
      done()
    });
  });

  it("should update user data", function(done) {
    api_post('/api/auth/update', [{_id: test_data.email, aaa: 111}], function (err, res) {
      assert.ifError(err);

      assert(res);
      assert(res.statusCode == 200);
      assert(res.body);
      assert(res.body[0] === null);
      assert(res.body[1]);

      done();
    });
  });

  /* @todo: add other tests (check that user changed) */

  initCookie();

});
