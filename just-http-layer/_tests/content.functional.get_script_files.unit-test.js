require('../../tests_globals.js').init();

it("should get mongoSitesApi.js", function(done) {
    api_get('/mongoSitesApi.js?site=test', function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.body);

        assert(res.body.indexOf('snapshots')    > -1);
        assert(res.body.indexOf('mgoInterface') > -1);

        done();
    })
});

it("should get mongoSitesApi.angular.js", function(done) {
    api_get('/mongoSitesApi.angular.js', function(err, res) {
        assert.ifError(err);

        assert(res);
        assert(res.body.indexOf(".service('$mongoSitesApi") > -1);

        done();
    })
});