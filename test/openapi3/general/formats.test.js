'use strict';

const chai = require('chai');
const expect = chai.expect;
const schemaValidatorGenerator = require('../../../src/index');
const path = require('path');

describe('formats', function () {
    let schema;
    before(function () {
        const swaggerPath = path.join(__dirname, 'formats.yaml');
        schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
    });
    describe('int32', function () {
        describe('positive', function () {
            it('max', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _int32: 2147483647
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
            it('min', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _int32: -2147483648
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
        });
        describe('negative', function () {
            it('max', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _int32: 2147483648
                });

                expect(validator.errors).to.be.eql([
                    {
                        dataPath: '._int32',
                        keyword: 'format',
                        message: 'should match format "int32"',
                        params: {
                            format: 'int32'
                        },
                        schemaPath: '#/properties/_int32/format'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
            it('min', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _int32: -2147483649
                });

                expect(validator.errors).to.be.eql([
                    {
                        dataPath: '._int32',
                        keyword: 'format',
                        message: 'should match format "int32"',
                        params: {
                            format: 'int32'
                        },
                        schemaPath: '#/properties/_int32/format'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
            it('double', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _int32: 2.147483649
                });

                expect(validator.errors).to.be.eql([
                    {
                        dataPath: '._int32',
                        keyword: 'type',
                        message: 'should be integer',
                        params: {
                            type: 'integer'
                        },
                        schemaPath: '#/properties/_int32/type'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
        });
    });
    describe('int64', function () {
        describe('positive', function () {
            it('max', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _int64: 9223372036854775807
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
            it('min', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _int64: -9223372036854775808
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
        });
        describe.skip('negative', function () {
            it('max', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _int64: 9223372036854775808
                });

                expect(validator.errors).to.be.eql([
                    {
                        dataPath: '._int64',
                        keyword: 'format',
                        message: 'should match format "int64"',
                        params: {
                            format: 'int64'
                        },
                        schemaPath: '#/properties/_int64/format'
                    }
                ]);
                expect(isBodysMatch).to.be.true;
            });
            it('min', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _int64: -9223372036854775809
                });

                expect(validator.errors).to.be.eql([
                    {
                        dataPath: '._int64',
                        keyword: 'format',
                        message: 'should match format "int64"',
                        params: {
                            format: 'int64'
                        },
                        schemaPath: '#/properties/_int64/format'
                    }
                ]);
                expect(isBodysMatch).to.be.true;
            });
        });
    });
    describe('double', function () {
        describe('positive', function () {
            it('integer', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _double: 4324132
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
            it('double', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _double: 4324132.323214213
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
            it('negative number', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _double: -4324132.323214213
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
        });
        describe.skip('negative', function () {
            it('max', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _double: Number.MAX_SAFE_INTEGER + 1
                });

                expect(validator.errors).to.be.eql([
                    {
                        dataPath: '._double',
                        keyword: 'format',
                        message: 'should match format "double"',
                        params: {
                            format: 'double'
                        },
                        schemaPath: '#/properties/_double/format'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
            it('min', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _double: Number.MIN_SAFE_INTEGER - 1
                });

                expect(validator.errors).to.be.eql([
                    {
                        dataPath: '._double',
                        keyword: 'format',
                        message: 'should match format "double"',
                        params: {
                            format: 'double'
                        },
                        schemaPath: '#/properties/_double/format'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
            it('float', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _double: 1e5
                });

                expect(validator.errors).to.be.eql([
                    {
                        dataPath: '._double',
                        keyword: 'format',
                        message: 'should match format "double"',
                        params: {
                            format: 'double'
                        },
                        schemaPath: '#/properties/_double/format'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
        });
    });
    describe('float', function () {
        describe('positive', function () {
            it('integer', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _float: 4324132
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
            it('double', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _float: 4324132.323214213
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
            it('negative', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _float: -4324132.323214213
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
            it('exponent', function () {
                const validator = schema['/types'].post.body['application/json'];

                const isBodysMatch = validator.validate({
                    _float: 10e5
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
        });
    });
});
