require('../../tests_globals.js').init();

[
  {
    email: random_email(),
    password: random_password()
  }
].map(function (test_data) {
  initCookie();

  it("should login with an existing user", function (done) {
    api_post('/api/auth', [user.email, user.password], function (err, res) {
      assert.ifError(err);

      assert(res);
      assert(res.statusCode == 200);
      assert(res.body);
      assert(res.body[0] === null);
      assert(res.body[1]);

      done();
    })
  });

  it("should update user data", function(done) {
    api_post('/api/auth/update', [test_data.password], function (err, res) {
      assert.ifError(err);

      assert(res);
      assert(res.statusCode == 200);
      assert(res.body);
      console.log('ololo', res.body);
      assert(res.body[0] === null);
      assert(res.body[1]);

      done();
    });

  });      

  initCookie(false);
});
