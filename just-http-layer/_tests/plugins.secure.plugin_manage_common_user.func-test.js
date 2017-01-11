require('../../tests_globals.js').init();

initCookie(user);
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

initCookie(admin);
var plugin;


it("should return plugin list with newly added plugin for admin", function(done) {
    api_post('/api/plugins/get', [{}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert.equal(res.statusCode, 200);

        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);

        assert(plugin = res.body[1][0]);

        done();
    })
});

initCookie(user);

it("should return error on save plugin", function(done) {
    api_post('/api/plugins/save', [plugin], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert.equal(res.statusCode, 403);

        assert(res.body);
        assert(res.body[0]);

        done();
    })
});

it("should return error on delete plugin", function(done) {
    api_post('/api/plugins/delete', [{_id: plugin._id}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert.equal(res.statusCode, 403);

        assert(res.body);
        assert(res.body[0]);

        done();
    })
});

initCookie(admin);

it("should check for plugin has not been deleted", function(done) {
    api_post('/api/plugins/get', [{_id: plugin._id}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert.equal(res.statusCode, 200);

        assert(res.body);
        assert(res.body[0] === null);

        assert(res.body[1]);

        assert(plugin._id == res.body[1][0]._id);

        done();
    })
});

initCookie(false);
