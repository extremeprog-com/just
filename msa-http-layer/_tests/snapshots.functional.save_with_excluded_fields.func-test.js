require('../../tests_globals.js').init();

initCookie(user);

var object;

it("should save object with excluded fields", function(done) {
    api_post(
        '/api/save',
        [
            {
                _type: "TestObject",
                _persist: {
                    ex_field_1: 1,
                    ex_field_2: 2
                },
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

it("should save again object with excluded fields", function(done) {
    api_post(
        '/api/save',
        [
            {
                _id: object._id,
                _type: "TestObject",
                _persist: {
                    ex_field_1: 1,
                    ex_field_2: 2,
                    ex_field_3: 5
                },
                title: 'Ololo',
                qqq: 'eee',
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

it("should get snapshot without excluded fields", function(done) {
    api_post(
        '/api/snapshots',
        [{_id: object._id}],
        function(err, res) {
            assert.ifError(err);

            assert(res);
            assert(res.statusCode == 200);

            assert(res.body);
            assert(res.body[0] === null);

            assert.equal(res.body[1][0]._persist, null);
            assert.equal(res.body[1][1]._persist, null);

            done();
        }
    )
});