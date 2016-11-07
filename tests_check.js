var fs = require('fs');
var tests = require('./tests_scenarios.js');
var colors = require('colors');

var written_path = [];

function write_path_and_message(path, message) {
    if(written_path.length == 0) {
        console.log();
        console.log();
        console.log();
        console.log();
        console.log('Please pay attention to not implemented tests:'.blue);
    }
    for(var i = 0; i < path.length; i++) {
        if(written_path[i] != path[i]) {
            written_path[i] = path[i];
            console.log();
            console.log("    " + Array.apply(0, Array(i)).map(function() { return '    ' }).join("") + 'Requirement: '.green + path[i]);
        }
    }
    console.log();
    console.log("    " + Array.apply(0, Array(i)).map(function() { return '    ' }).join("") + '  ' + message);
}

(function parseUncompletedTests(base, path) {
    if(Object.keys(base).length == 0) {
        write_path_and_message(path, "no test scenarios found".red);
    }
    if(base instanceof Array) {
        for(var i = 0; i < base.length; i++) {
            var matches = base[i].match(/^(unit|func|e2e)\s+([^:\s]+)\s*:\s*(.+)$/);
            var type = matches[1];
            var filename =  matches[2] + '.' + type + '-test.js';
            var description = matches[3];
            if(!fs.existsSync(filename)) {
                write_path_and_message(path, "file not found: ".blue + ' ' + description.red + ' ' + filename.red);
            }
        }
    } else {
        Object.keys(base).map(function(key) {
            parseUncompletedTests(base[key], path.concat([key]))
        })
    }
})(tests, []);

console.log();
