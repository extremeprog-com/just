require('../../tests_globals.js').init();

[
  {
    email: random_email(),
    password: random_password()
  }
].map(function (test_data) {

  var activation_link;

  it("should register new user", function(done) {
    api_post("/api/auth/register", [{
      _id: test_data.email,
      password: test_data.password
    }], function(err, res) {
      assert.ifError(err);
      console.log(res.body[0]);

      assert(res);
      assert(res.statusCode == 200);
      assert(res.body);
      assert(res.body[0] === null);
      assert(res.body[1]);

      activation_link = res.body[1].activation_link;

      done();
    });

  })

  // it was written by my hand, a step is not generated

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

  it("should login with an existing user", function(done) {
    api_post('/api/auth', [test_data.email, test_data.password], function (err, res) {
      assert.ifError(err);

      assert(res);
      assert(res.statusCode == 200);
      assert(res.body);
      assert(res.body[0] === null);
      assert(res.body[1]);

      done();
    });
  })

  it("should return success on deleting new user", function(done) {
    api_post('/api/auth/delete', [[test_data.email]], function (err, res) {
      assert.ifError(err);

      assert(res);
      assert(res.statusCode == 200);
      assert(res.body);

      done();
    });

  })

  it("should return error when trying to login with removed user", function(done) {
    api_post('/api/auth', [test_data.email, test_data.password], function (err, res) {
      assert.ifError(err);

      assert(res);
      assert(res.statusCode == 400);
      assert(res.body);
      assert(res.body[0]);

      done();
    })

  });

  initCookie(false);
});
