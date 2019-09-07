const bigInt = require('big-integer');

module.exports = Object.freeze({
    buildRequests: true,
    buildResponses: true,
    formats: [
        {
            name: 'int64',
            pattern: {
                validate: (value) => {
                    if (bigInt(value).compare(9223372036854775807) <= 0) return true;
                    if (bigInt(value).compare(-9223372036854775808) >= 0) return true;
                    return false;
                },
                type: 'number'
            }
        },
        {
            name: 'int32',
            pattern: {
                validate: (value) => parseInt(value) && value >= -2147483648 && value <= 2147483647,
                type: 'number'
            }
        },
        {
            name: 'float',
            pattern: {
                validate: (value) => Number.parseFloat(value),
                type: 'number'
            }
        },
        {
            name: 'double',
            pattern: {
                validate: (value) => Number.parseFloat(value),
                type: 'number'
            }
        },
        {
            name: 'file',
            pattern: {}
        },
        {
            name: 'binary',
            pattern: {}
        },
        {
            name: 'password',
            pattern: {}
        }
    ]
});