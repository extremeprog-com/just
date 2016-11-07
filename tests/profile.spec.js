['ios', 'android'].map(device, function() {
    [
        {
            email: "fig1@gmail.com",
            password: ''
        },
        {
            email: "fig2@gmail.com"
        }
    ].map(function(test_data) {
        describe("Test profile functions", function() {

            var the = {};

            it("run tab", function() {
                the.browser = new Browser({
                    device: device,
                    build: process.env.BUILD_NUMBER
                });
            });

            it("register", the.browser.run(function() {
                the.user = test_globals.api_post({
                    _id: test_data.email,
                    password
                });
                return the.user.getPromise().then(function() {

                });
            }));

            it("register with existing account", function() {

            });

            it("login to unactivated account", function() {

            });

            it("click activation link", function() {

            });

            it("login", function() {

            });

            it("check access when logged in", function() {

            });

            it("wrong login", function() {

            });

            it("logout", function() {

            });

            it("check access when logged out", function() {

            });

        });

        describe("Test function layer", function() {


        });
    });


});

