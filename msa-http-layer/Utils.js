const crypto      = require('crypto');

Utils = {
    algorithm: 'aes192',
    password : 'd6F3Ef9efwh3n90s03eq',

    encrypt: function(buffer) {
        var cipher = crypto.createCipher(this.algorithm, this.password);
        return Buffer.concat([cipher.update(buffer), cipher.final()]).toString('base64');
    },
    decrypt: function(buffer) {
        var decipher = crypto.createDecipher(this.algorithm, this.password);
        return decipher.update(new Buffer(buffer, 'base64')) + decipher.final();
    }
};


module.exports = Utils;