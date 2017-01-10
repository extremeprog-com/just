require('../../tests_globals.js').init();

it("should get just.extremeprog.js", function(done) {
    api_get('/just.extremeprog.js?site=test', function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.body);

        assert(res.body.indexOf('snapshots')    > -1);
        assert(res.body.indexOf('mgoInterface') > -1);

        done();
    })
});

it("should get just.extremeprog.angular.js", function(done) {
    api_get('/just.extremeprog.angular.js', function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.body.indexOf(".service('$just") > -1);

        done();
    })
});
