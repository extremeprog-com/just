require('../../tests_globals.js').init();

initCookie(admin);

var Plugin1, Plugin2;
var pluginFileContent = "hahaha <div><div></div>";

it("add file plugin that change test flag to 2 for {qqq: 'iii'}", function(done) {
    var fs = require('fs');

    fs.mkdir('plugins/test', function() {
        fs.writeFileSync('plugins/test/test_plugin.json', JSON.stringify({
            _type: "Plugin", "title": random_title() + random_title(),
            tf: 2, test_plag: [ [{},{qqq: 'iii'}, {x: 2, html: 'test_plugin.html'}]], test_glag: [ [{},{qqq: 'iii'}, {x: 2, html: 'test_plugin.html'}]]
        }) );
        fs.writeFileSync('plugins/test/test_plugin.html', pluginFileContent );
        fs.writeFileSync('plugins/test/test_plugin2.json', JSON.stringify({
            _type: "Plugin", "title": random_title() + random_title(),
            tf: 2, test_clag: [ [{}, {}, {x: 3, html: 'test_plugin.html'}]]
        }) );
        done();
    });
});

restart_server();

it("should check that test flag is 3 for filter {qqq:iii} and file content was loaded", function(done) {
    api_post('/api/plugins/test', [{qqq: 'iii'}], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(res.body[1].test_plag.x == 2);
        assert(res.body[1].test_clag.x == 3);
        assert(res.body[1].test_plag.html == pluginFileContent);
        assert(res.body[1].test_clag.html == pluginFileContent);

        done();
    })
});

it("should check that test flag is 2 for filter (null) and file content was loaded", function(done) {
    api_post('/api/plugins/test', [null], function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.statusCode == 200);
        assert(res.body);
        assert(res.body[0] === null);
        assert(res.body[1]);
        assert(res.body[1].test_clag.x == 3);
        assert(res.body[1].test_clag.html == pluginFileContent);

        done();
    })
});

it("remove plugin file", function(done) {
    var fs = require('fs');

    fs.unlinkSync('plugins/test/test_plugin.json');
    fs.unlinkSync('plugins/test/test_plugin2.json');
    fs.unlink('plugins/test/test_plugin.html');
    done()
});


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

initCookie(false);