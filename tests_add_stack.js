var colors = require('colors');
var fs = require('fs');
var firstAtFile, firstAtLine, firstAtChar;

var contents = '';

process.stdin.on('readable', function() {
    var idx, c;

    contents += (process.stdin.read() || '').toString();

    while((idx = contents.indexOf("\n")) > -1) {
        var chunk = contents.substr(0, idx + 1);

        contents = contents.substr(idx + 1);
        if(!firstAtFile) {
            var matches = chunk.toString().match(/at .*?([^()]+?.js):(\d+):(\d+)/);
            if(matches) {
                firstAtFile = matches[1];
                firstAtLine = parseInt(matches[2]);
                firstAtChar = parseInt(matches[3]);
                console.log();
                console.log((firstAtFile + ":" + firstAtLine + ':' + firstAtChar).red);
                console.log();
                try {
                    var lines = fs.readFileSync(firstAtFile).toString().split("\n").slice(firstAtLine - 5, firstAtLine + 2);
                    lines[4] = lines[4].red;
                    console.log(lines.join("\n"));
                    console.log();
                } catch(e) {
                    // console.error('Error at tests_a',e);
                    // console.log();
                }
            }
        }
        process.stdout.write(chunk)
    }
});

process.stdin.on('end', function() {
    process.stdout.write(contents);
    if(firstAtFile) {
        console.log(fs.existsSync('tests_debug.log') ? "\nLogged resources:\n".red + fs.readFileSync('tests_debug.log').toString().split("\n").slice(0, 10).map(function(it) { return it.substr(0, 1024) }).join("\n") + "\n\n" : '');
    }
});
