require('../../tests_globals.js').init();

initCookie(user);

var object;

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

it('should update object', function(done) {

    object.title = 'Ogogo';

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

it('should get snapshot and check fields', function(done) {
    api_post(
        '/api/snapshots',
        [{_id: object._id}],
        function(err, res) {
            assert.ifError(err);

            assert(res);
            assert(res.statusCode == 200);

            assert(res.body);
            assert(res.body[0] === null);

            assert.equal(res.body[1][0]._terminated, null);
            assert.equal(res.body[1][1]._terminated, res.body[1][1]._modified);
            assert.equal(res.body[1][1]._originated, res.body[1][0]._modified);

            done();
        }
    )
});