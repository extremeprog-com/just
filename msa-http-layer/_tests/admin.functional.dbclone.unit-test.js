require('../../tests_globals.js').init();

it("should clone db from reference", function(done) {
    api_post(
        '/api/admin/dbclone'
        , { sitename: 'myfoxtail', key: '123'}
        , function(err, res) {
            assert.ifError(err);

            assert(res);
            assert.equal(res.statusCode, 200);

            done();
        }
    )
});