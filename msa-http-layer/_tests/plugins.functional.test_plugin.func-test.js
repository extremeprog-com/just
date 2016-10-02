require('../../tests_globals.js').init();

initCookie(admin);

var Plugin1, Plugin2;

it("should add plugin with object filter {qqq:eee} that change test flag to 1", function(done) {
    api_post('/api/plugins/save', [ {_type: "Plugin", "title": random_title() + random_title(), tf: 1, test_flag: [ [{},{qqq: 'eee'}, 1]] } ], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(Plugin1 = res.body[1]);

        done();
    })
});

it("should check that test flag is 1 for filter {qqq:eee}", function(done) {
    api_post('/api/plugins/test', [{qqq: 'eee'}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(res.body[1].test_flag == 1);

        done();
    })
});

it("should check that test flag is 1 for filter {}", function(done) {
    api_post('/api/plugins/test', [{qqq: 'eee'}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(res.body[1].test_flag == 1);

        done();
    })
});

it("should check that test flag is undefined for filter {qqq:ppp}", function(done) {
    api_post('/api/plugins/test', [{qqq: 'ppp'}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(res.body[1].test_flag == undefined);

        done();
    })
});

it("should add plugin that change test flag to 0", function(done) {
    api_post('/api/plugins/save', [{_type: "Plugin", "title": random_title() + random_title(), tf: 0, test_flag: [ [{},{qqq: 'eee'}, 0] ] }] , function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(Plugin2 = res.body[1]);

        done();
    })
});

it("should check that test flag is 0", function(done) {
    api_post('/api/plugins/test', [{qqq: 'eee'}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(res.body[1].test_flag == 0);

        done();
    })
});

it("should change last plugin order to 0", function(done) {
    Plugin2._order = 0;
    api_post('/api/plugins/save', [Plugin2], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] == null );
        assert(Plugin2 = res.body[1]);

        done();
    })
});

it("should check check that test flag is 1 again", function(done) {
    api_post('/api/plugins/test', [{qqq: 'eee'}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(res.body[1].test_flag == 1);

        done();
    })

});