require('../../tests_globals.js').init();

it("should clone db from reference", function(done) {
    api_post(
        '/api/admin/site_clone'
        , { sitename: 'myfoxtail', api_key: system_api_key, refname: 'test' }
        , function(err, res) {
            assert.ifError(err);

            assert(res);
            assert.equal(res.statusCode, 200);

            done();
        }
    )
});