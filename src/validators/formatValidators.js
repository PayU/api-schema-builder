const Decimal = require('decimal.js');

const constraints = {
    int64: {
        max: new Decimal('9223372036854775807'),
        min: new Decimal('-9223372036854775808')
    },
    float: {
        max: new Decimal(2).pow(128),
        min: new Decimal(2).pow(128).negated()
    },
    double: {
        max: new Decimal(2).pow(1024),
        min: new Decimal(2).pow(1024).negated()
    },
    byte: {
        regex: /^[a-zA-Z0-9/+]+={0,2}$/
    }
};

const defaultFormatsValidators = [
    {
        name: 'int64',
        pattern: {
            validate: (value) =>
                constraints.int64.max.greaterThanOrEqualTo(value) &&
                constraints.int64.min.lessThanOrEqualTo(value),
            type: 'number'
        }
    },
    {
        name: 'int32',
        pattern: {
            validate: (value) =>
                value >= -2147483648 &&
                value <= 2147483647,
            type: 'number'
        }
    },
    {
        name: 'float',
        pattern: {
            validate: (value) =>
                constraints.float.max.greaterThanOrEqualTo(value) &&
                constraints.float.min.lessThanOrEqualTo(value),
            type: 'number'
        }
    },
    {
        name: 'double',
        pattern: {
            validate: (value) =>
                constraints.double.max.greaterThanOrEqualTo(value) &&
                constraints.double.min.lessThanOrEqualTo(value),
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
    },
    {
        name: 'byte',
        pattern: {
            validate: (value) =>
                value.length % 4 === 0 &&
                constraints.byte.regex.test(value)
        }
    }
];

module.exports = { defaultFormatsValidators };