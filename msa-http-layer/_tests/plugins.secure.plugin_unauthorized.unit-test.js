require('../../tests_globals.js').init();

var plugin_name = random_title();

it("should return error on add plugin", function(done) {
    api_post('/api/plugins/save',
        [
            {
                _type: "Plugin",
                title: plugin_name,
                test_field: [
                    [ { admin: true }, {}, 666 ]
                ]
            }
        ],
        function(err, res) {
            assert.ifError(err);

            assert(res);
            assert.equal(res.statusCode, 403);

            assert(res.body);
            assert(res.body[0]);

            done();
        }
    )
});

it("should return error on get plugin", function(done) {
    api_post('/api/plugins/get', [{}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert.equal(res.statusCode, 403);

        assert(res.body);
        assert(res.body[0]);

        done();
    })
});

it("should return error on delete plugin", function(done) {
    api_post('/api/plugins/delete', [{_id: "123123"}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert.equal(res.statusCode, 403);

        assert(res.body);
        assert(res.body[0]);

        done();
    })
});