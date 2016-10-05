require('../../tests_globals.js').init();

initCookie(user);

var object, snapshot;

it("should save object", function(done) {
    api_post(
        '/api/save',
        [
            {
                _type: "TestObject",
                title: 'Ololo',
                test_field: [
                    [ { aaa: true }, {}, 666 ]
                ]
            }
        ],
        function(err, res) {
            assert.ifError(err);

            assert(res);
            assert(res.statusCode == 200);

            assert(res.body);
            assert(res.body[0] === null);

            assert(object = res.body[1]);

            done();
        }
    )
});

it("should get snapshot", function(done) {
    api_post(
        '/api/snapshots',
        [{_id: object._id}],
        function(err, res) {
            assert.ifError(err);

            assert(res);
            assert(res.statusCode == 200);

            assert(res.body);
            assert(res.body[0] === null);

            assert(snapshot = res.body[1][0]);

            done();
        }
    )
});

it("should save the same object", function(done) {
    api_post(
        '/api/save',
        [
            object
        ],
        function(err, res) {
            assert.ifError(err);

            assert(res);
            assert(res.statusCode == 200);

            assert(res.body);
            assert(res.body[0] === null);

            done();
        }
    )
});

it("should return only one snapshot", function(done) {
    api_post(
        '/api/snapshots',
        [{_id: object._id}],
        function(err, res) {
            assert.ifError(err);

            assert(res);
            assert(res.statusCode == 200);

            assert(res.body);
            assert(res.body[0] === null);

            assert.equal(res.body[1].length, 1);
            assert.equal(res.body[1][0]._snapshot_id, snapshot._snapshot_id);
            assert.equal(res.body[1][1], null);

            done();
        }
    )
});