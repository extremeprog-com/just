require('../../tests_globals.js').init();

initCookie(admin);

var plugin_name = random_title();
var plugin_id;

var GeneratedPlugin;

it("should add plugin", function(done) {
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
            assert(res.statusCode == 200);
            assert(res.body);
            assert(res.body[0] === null);
            assert(GeneratedPlugin = res.body[1]);
            assert(res.body[1]._id);
            assert(res.body[1]._order);

            done();
        }
    )
});

it("should return plugin list with newly added plugin", function(done) {
    api_post('/api/plugins/get', [{}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(plugin_id = res.body[1].filter(function(it) { return it && it.title == plugin_name && it._id })[0]._id);
        assert(res.body[1].filter(function(it) { return it && it.title == plugin_name && it._id })[0].test_field[0][2] == 666);

        done();
    })
});

it("save plugin with other parameter", function(done) {
    GeneratedPlugin.test_field[0][2] = 555;
    api_post('/api/plugins/save', [GeneratedPlugin], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(res.body[1]._id);
        assert(res.body[1]._order);

        done();
    })
});

it("check that plugin updated", function(done) {
    api_post('/api/plugins/get', [{}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(res.body[1].length);
        assert(res.body[1].filter(function(it) { return it && it.title == plugin_name && it._id })[0].test_field[0][2] == GeneratedPlugin.test_field[0][2]);

        done();
    })
});


it("should delete plugin", function(done) {
    api_post('/api/plugins/delete', [{_id: plugin_id}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);

        done();
    })
});

it("should return plugin list without newly added plugin", function(done) {
    api_post('/api/plugins/get', [{}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(!res.body[1].filter(function(it) { return it && it.title == plugin_name && it._id })[0]);

        done();
    })
});
