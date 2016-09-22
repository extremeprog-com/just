require('core-os');

classes.JohnnyHelper = {
    printHelp: function () {
        var request = CatchRequest(Johnny_CommandRequest);

        return function (success, fail) {

            if (request.params[0] === '--help' || request.params[0] === '-h') {
                console.log(
                    '\n',
                    '  Hi! My name is Johnny. I make your testing process easier and more interesting. Here is what I know how:\n\n',
                    '      generate <path_to_test_file>\n',
                    '          generate test file with the cases from tests suites\n');

                success();
            } else {
                fail();
            }
        }
    }
};