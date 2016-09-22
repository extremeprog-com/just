require('core-os');

const tests = require('./tests_scenarios.js');
const fs = require('fs');
const path = require('path');

Core.registerRequestPoint('JohnnyGenerator_GenerateRequest');

classes.JohnnyGenerator = {
    checkGenerateCommand: function () {
        var request = CatchRequest(Johnny_CommandRequest);

        return function (success, fail) {
            if (request.params[0] == 'generate') {
                if (!request.params[1]) {
                    console.error('Please, specify the file to generate. Refer test_scenarios.js.');
                } else {
                    (function parseTests(base, fpath) {
                        if (base instanceof Array) {
                            for (var i = 0; i < base.length; i++) {
                                var
                                      matches       = base[i].match(/^(unit|func|e2e)\s+([^:\s]+)\s*:\s*(.+)$/)
                                    , type          = matches[1]
                                    , filename      = matches[2] + '.' + type + '-test.js'
                                    , description   = matches[3];

                                if (filename == request.params[1]) {
                                    if (fs.existsSync('test/' + filename)) {
                                        console.error('The test file already exists.');
                                    } else {
                                        var dirname = path.dirname('test/' + filename);
                                        if (!fs.statSync(dirname).isDirectory()) {
                                            fs.mkdirSync(dirname);
                                        }

                                        FireRequest(
                                            new JohnnyGenerator_GenerateRequest({
                                                cases: description,
                                                filename: 'test/' + filename
                                            }),
                                            function () {
                                            },
                                            function () {
                                            }
                                        )
                                    }
                                }
                            }
                        } else {
                            Object.keys(base).map(function (key) {
                                parseTests(base[key], fpath.concat([key]))
                            })
                        }
                    })(tests, []);
                }
                success();
            } else {
                fail();
            }
        }
    },
    generateTests: function () {
        var request = CatchRequest(JohnnyGenerator_GenerateRequest);

        return function (success, fail) {
            var cases = request.cases.split(',');
            var its = cases.map(function (it) {
                return '\nit("should ' + it.trimLeft() + '", function(done) {\n\n})';
            });

            fs.writeFileSync(request.filename, its.join('\n'));
            console.log('File ' + request.filename + ' has been generated.')

            success();
        }
    }
};