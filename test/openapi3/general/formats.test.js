'use strict';

const chai = require('chai');
const expect = chai.expect;
const schemaValidatorGenerator = require('../../../src/index');
const path = require('path');

describe('formats', function () {
    const swaggerPath = path.join(__dirname, 'formats.yaml');
    const schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath);
    const validator = schema['/types'].post.body['application/json'];

    describe('int32', function () {
        it('valid values', function () {
            expect(validator.validate({ _int32: 0 })).to.be.true;
            expect(validator.validate({ _int32: 1.0 })).to.be.true;
            expect(validator.validate({ _int32: 2147483647 })).to.be.true;
            expect(validator.validate({ _int32: -2147483648 })).to.be.true;
        });
        it('invalid values', function () {
            expect(validator.validate({ _int32: '1' })).to.be.false;
            expect(validator.validate({ _int32: 1.2 })).to.be.false;
            expect(validator.validate({ _int32: 2147483648 })).to.be.false;
            expect(validator.validate({ _int32: -2147483649 })).to.be.false;
        });
    });
    describe('int64', function () {
        it('valid values', function () {
            expect(validator.validate({ _int64: 0 })).to.be.true;
            expect(validator.validate({ _int64: 1 })).to.be.true;
            expect(validator.validate({ _int64: 23.0 })).to.be.true;
            expect(validator.validate({ _int64: -23.0 })).to.be.true;
            expect(validator.validate({ _int64: 9223372036854775000 })).to.be.true;
            expect(validator.validate({ _int64: -9223372036854775000 })).to.be.true;
        });
        it('invalid values', function () {
            expect(validator.validate({ _int64: '0' })).to.be.false;
            expect(validator.validate({ _int64: 23.2 })).to.be.false;
            expect(validator.validate({ _int64: -23.3 })).to.be.false;
            expect(validator.validate({ _int64: 9223372036854775808 })).to.be.false;
            expect(validator.validate({ _int64: -9223372036854775809 })).to.be.false;
        });
    });
    describe('double', function () {
        it('valid values', function () {
            expect(validator.validate({ _double: 0 })).to.be.true;
            expect(validator.validate({ _double: 1 })).to.be.true;
            expect(validator.validate({ _double: 1.0 })).to.be.true;
            expect(validator.validate({ _double: -1.0 })).to.be.true;
            expect(validator.validate({ _double: 9223372036854775000 })).to.be.true;
            expect(validator.validate({ _double: -9223372036854775000 })).to.be.true;
            expect(validator.validate({ _double: 1.7976931348623158e308 })).to.be.true;
            expect(validator.validate({ _double: -1.7976931348623158e308 })).to.be.true;
        });
        it('invalid values', function () {
            expect(validator.validate({ _double: '0' })).to.be.false;
            expect(validator.validate({ _double: Number.POSITIVE_INFINITY })).to.be.false;
            expect(validator.validate({ _double: Number.NEGATIVE_INFINITY })).to.be.false;
        });
    });
    describe('float', function () {
        it('valid values', function () {
            expect(validator.validate({ _float: 0 })).to.be.true;
            expect(validator.validate({ _float: 1 })).to.be.true;
            expect(validator.validate({ _float: 1.0 })).to.be.true;
            expect(validator.validate({ _float: -1.0 })).to.be.true;
            expect(validator.validate({ _float: 9223372036854775000 })).to.be.true;
            expect(validator.validate({ _float: -9223372036854775000 })).to.be.true;
            expect(validator.validate({ _float: 3.402823466e38 })).to.be.true;
            expect(validator.validate({ _float: -3.402823466e38 })).to.be.true;
        });
        it('invalid values', function () {
            expect(validator.validate({ _float: '0' })).to.be.false;
            expect(validator.validate({ _float: Number.POSITIVE_INFINITY })).to.be.false;
            expect(validator.validate({ _float: Number.NEGATIVE_INFINITY })).to.be.false;
        });
    });
    describe('byte', function () {
        it('valid values', function () {
            expect(validator.validate({ _byte: 'QQ==' })).to.be.true;
            expect(validator.validate({ _byte: 'YmFzZTY0' })).to.be.true;
            expect(validator.validate({ _byte: 'YmFzZTY0IAZ=' })).to.be.true;
        });
        it('invalid values', function () {
            expect(validator.validate({ _byte: 'QQ' })).to.be.false;
            expect(validator.validate({ _byte: 'QQ=' })).to.be.false;
            expect(validator.validate({ _byte: 'YmFzZTY' })).to.be.false;
            expect(validator.validate({ _byte: 'YmFzZTY0IQ' })).to.be.false;
        });
    });

    describe('custom format', function () {
        const swaggerPath = path.join(__dirname, 'formats-custom.yaml');
        const schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {
            formats: [
                {
                    name: 'custom',
                    pattern: {
                        validate: (value) => value === 'My Custom Format',
                        type: 'string'
                    }
                }
            ]
        });

        const validator = schema['/types'].post.body['application/json'];

        it('valid values', function () {
            expect(validator.validate({ _custom: 'My Custom Format' })).to.be.true;
        });
        it('invalid values', function () {
            expect(validator.validate({ _custom: 'Another format' })).to.be.false;
        });
        it('built in formats', function () {
            expect(validator.validate({ _int32: 1 })).to.be.true;
            expect(validator.validate({ _int32: 2147483648 })).to.be.false;
            expect(validator.validate({ _int64: 9223372036854775000 })).to.be.true;
            expect(validator.validate({ _int64: 9223372036854775808 })).to.be.false;
            expect(validator.validate({ _byte: 'YmFzZTY0IAZ=' })).to.be.true;
            expect(validator.validate({ _byte: 'YmFzZTY0IQ' })).to.be.false;
        });
    });
});
