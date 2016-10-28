const crypto      = require('crypto');

Utils = {
    algorithm: 'aes192',

    encrypt: function(password, buffer) {
        var cipher = crypto.createCipher(this.algorithm, password);
        return Buffer.concat([cipher.update(buffer), cipher.final()]).toString('base64');
    },
    decrypt: function(password, buffer) {
        var decipher = crypto.createDecipher(this.algorithm, password);
        return decipher.update(new Buffer(buffer, 'base64')) + decipher.final();
    }
};


module.exports = Utils;