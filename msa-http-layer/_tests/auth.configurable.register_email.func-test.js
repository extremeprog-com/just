require('../../tests_globals.js').init();

[
    {
        email      : random_email(),
        password   : random_password(),
        plugin_name: random_title()
    }
].map(function(test_data) {

    initCookie(admin);

    it("should add plugin with register email template", function(done) {
        api_post('/api/plugins/save',
            [
                {
                    _type: "Plugin",
                    title: test_data.plugin_name,
                    register_email: {
                        subject: "hahaha",
                        html: '<html>mumumu {{mumumu}}</html>'
                    }
                }
            ],
            function(err, res) {
                assert.ifError(err);

                assert(res);
                assert(res.statusCode == 200);

                done();
            }
        )
    });

    it("should get mail options suited to plugin on register", function(done) {
        api_post("/api/auth/register", [{
            _id: test_data.email,
            password: test_data.password
        }], function(err, res) {
            assert.ifError(err);

            assert(res);
            assert(res.statusCode == 200);
            assert(res.body);

            assert(res.body[0] === null);
            assert(res.body[1]);
            assert(res.body[1].mailOptions);

            assert(res.body[1].mailOptions.html);
            assert.equal(res.body[1].mailOptions.html.match(/hahaha/));

            assert(res.body[1].mailOptions.subject);
            assert.equal(res.body[1].mailOptions.subject.match(/mumumu/));

            done();
        });
    });
});

