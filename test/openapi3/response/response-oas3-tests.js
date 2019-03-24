'use strict';

let chai = require('chai'),
    expect = chai.expect,
    schemaValidatorGenerator = require('../../../src/index'),
    path = require('path'),
    uuid = require('uuid/v4');

describe('oas3 check - general', function () {
    let schema;
    before(function () {
        const swaggerPath = path.join(__dirname, 'pets-response.yaml');
        return schemaValidatorGenerator.buildSchema(swaggerPath, {}).then(receivedSchema => {
            schema = receivedSchema;
        });
    });

    describe('check headers', function () {
        let schemaEndpoint;
        before(function() {
            schemaEndpoint = schema['/pet-header']['get'].responses['200'];
        });
        it('valid headers', function () {
            let isMatch = schemaEndpoint.validate({ headers: { 'x-zooz-request-id': uuid() } });
            expect(schemaEndpoint.errors).to.be.equal(null);
            expect(isMatch).to.be.true;
        });
        it('invalid type for headers', function () {
            let isMatch = schemaEndpoint.validate({ headers: { 'x-zooz-request-id': '123' } });
            expect(schemaEndpoint.errors).to.be.eql([{
                'keyword': 'format',
                'dataPath': ".headers['x-zooz-request-id']",
                'schemaPath': '#/headers/properties/x-zooz-request-id/format',
                'params': {
                    'format': 'uuid'
                },
                'message': 'should match format "uuid"'
            }]);
            expect(isMatch).to.be.false;
        });
    });

    describe('check body', function () {
        describe('simple body', function () {
            let schemaEndpoint;

            before(function () {
                schemaEndpoint = schema['/dog']['post'].responses['201'];
            });
            it('valid simple body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark': 'hav hav'
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(isMatch).to.be.true;
            });
            it('missing required field in simple body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark1': 'hav hav'
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body',
                        'keyword': 'required',
                        'message': "should have required property 'bark'",
                        'params': {
                            'missingProperty': 'bark'
                        },
                        'schemaPath': '#/body/required'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
            it('invalid field type in simple body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark': 123
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.bark',
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/body/properties/bark/type'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
        });
        describe('anyOf body', function () {
            let schemaEndpoint;
            before(function () {
                schemaEndpoint = schema['/pet-any-of']['post'].responses['201'];
            });
            it('valid full body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark': 'hav hav',
                            'fur': 1
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(isMatch).to.be.true;
            });

            it('missing required field in body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {},
                headers: {} });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body',
                        'keyword': 'required',
                        'message': "should have required property 'bark'",
                        'params': {
                            'missingProperty': 'bark'
                        },
                        'schemaPath': '#/body/anyOf/0/required'
                    },
                    {
                        'dataPath': '.body',
                        'keyword': 'required',
                        'message': "should have required property 'fur'",
                        'params': {
                            'missingProperty': 'fur'
                        },
                        'schemaPath': '#/body/anyOf/1/required'
                    },
                    {
                        'dataPath': '.body',
                        'keyword': 'anyOf',
                        'message': 'should match some schema in anyOf',
                        'params': {},
                        'schemaPath': '#/body/anyOf'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
            it('invalid field type in body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark': 111,
                            'fur': 'wrong'
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.bark',
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/body/anyOf/0/properties/bark/type'
                    },
                    {
                        'dataPath': '.body.fur',
                        'keyword': 'pattern',
                        'message': 'should match pattern "^\\d+$"',
                        'params': {
                            'pattern': '^\\d+$'
                        },
                        'schemaPath': '#/body/anyOf/1/properties/fur/pattern'
                    },
                    {
                        'dataPath': '.body',
                        'keyword': 'anyOf',
                        'message': 'should match some schema in anyOf',
                        'params': {},
                        'schemaPath': '#/body/anyOf'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
        });
        describe('allOf body', function () {
            let schemaEndpoint;

            before(function () {
                schemaEndpoint = schema['/pet-all-of']['post'].responses['201'];
            });
            it('valid full body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark': 'hav hav',
                            'fur': '11'
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(isMatch).to.be.true;
            });
            it('missing required field in body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark': 'hav hav'
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body',
                        'keyword': 'required',
                        'message': "should have required property 'fur'",
                        'params': {
                            'missingProperty': 'fur'
                        },
                        'schemaPath': '#/body/allOf/1/required'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
            it('invalid field type in body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark': 111,
                            'fur': 'wrong'
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.bark',
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/body/allOf/0/properties/bark/type'
                    },
                    {
                        'dataPath': '.body.fur',
                        'keyword': 'pattern',
                        'message': 'should match pattern "^\\d+$"',
                        'params': {
                            'pattern': '^\\d+$'
                        },
                        'schemaPath': '#/body/allOf/1/properties/fur/pattern'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
        });
        describe('simple body', function () {
            let schemaEndpoint;

            before(function () {
                schemaEndpoint = schema['/dog']['post'].responses['201'];
            });
            it('valid simple body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark': 'hav hav'
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(isMatch).to.be.true;
            });
            it('missing required field in simple body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark1': 'hav hav'
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body',
                        'keyword': 'required',
                        'message': "should have required property 'bark'",
                        'params': {
                            'missingProperty': 'bark'
                        },
                        'schemaPath': '#/body/required'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
            it('invalid field type in simple body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'bark': 123
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.bark',
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/body/properties/bark/type'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
        });
        describe('schema with route', function () {
            let schemaEndpoint;

            before(function () {
                schemaEndpoint = schema['/pets-path/:name']['get'].responses['200'];
            });
            it('valid simple body', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'fur': '1'
                        },
                headers: {} });
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(isMatch).to.be.true;
            });

            it('missing required field', function () {
                let isMatch = schemaEndpoint.validate({ body:
                        {
                            'fur': 'hav hav'
                        },
                headers: {} });

                expect(schemaEndpoint.errors[0].message).to.be.equal("should have required property 'bark'");
                expect(schemaEndpoint.errors[1].message).to.be.equal('should match pattern "^\\d+$"');
                expect(schemaEndpoint.errors[2].message).to.be.equal('should match exactly one schema in oneOf');
                expect(isMatch).to.be.false;
            });
        });
        describe('body with discriminator', function () {
            let schemaEndpoint;

            before(function () {
                schemaEndpoint = schema['/dog']['post'].responses['201'];
            });
            describe('discriminator-pet', function () {
                let schemaEndpoint;
                before(function () {
                    schemaEndpoint = schema['/pet-discriminator']['post'].responses['201'];
                });
                it('missing discriminator field', function () {
                    let isMatch = schemaEndpoint.validate({ body: {
                        'bark': 'hav hav'
                    },
                    headers: {} });

                    expect(schemaEndpoint.errors.length).to.be.equal(1);
                    expect(schemaEndpoint.errors[0].message).to.equal('should be equal to one of the allowed values');
                    expect(schemaEndpoint.errors[0].dataPath).to.equal('.body.type');
                    expect(schemaEndpoint.errors[0].keyword).to.equal('enum');
                    expect(schemaEndpoint.errors[0].params.allowedValues).to.eql([
                        'dog_object',
                        'cat_object'
                    ]);
                    expect(isMatch).to.be.false;
                });
                it('when discriminator type is dog and missing field', function () {
                    let isMatch = schemaEndpoint.validate({
                        body: {
                            'type': 'dog_object'
                        },
                        headers: {}
                    });
                    expect(schemaEndpoint.errors).to.be.eql([
                        {
                            'dataPath': '.body',
                            'keyword': 'required',
                            'message': "should have required property 'bark'",
                            'params': {
                                'missingProperty': 'bark'
                            },
                            'schemaPath': '#/body/required'
                        }]);
                    expect(isMatch).to.be.false;
                });
                it('valid complex body', function () {
                    let isMatch = schemaEndpoint.validate({ body:
                            {
                                bark: 'hav hav',
                                type: 'dog_object'
                            },
                    headers: {} });
                    expect(schemaEndpoint.errors).to.be.equal(null);
                    expect(isMatch).to.be.true;
                });
            });
            describe('discriminator-multiple pet', function () {
                before(function () {
                    schemaEndpoint = schema['/pet-discriminator-multiple']['post'].responses['201'];
                });
                it('missing discriminator field', function () {
                    let isMatch = schemaEndpoint.validate({
                        body: {
                            'fur': 'hav hav'
                        },
                        headers: {} });

                    expect(schemaEndpoint.errors.length).to.be.equal(1);
                    expect(schemaEndpoint.errors[0].message).to.equal('should be equal to one of the allowed values');
                    expect(schemaEndpoint.errors[0].dataPath).to.equal('.body.type');
                    expect(schemaEndpoint.errors[0].keyword).to.equal('enum');
                    expect(schemaEndpoint.errors[0].params.allowedValues).to.eql([
                        'dog_multiple',
                        'cat_object'
                    ]);
                    expect(isMatch).to.be.false;
                    expect(isMatch).to.be.false;
                });
                it('missing discriminator field on the on inside discriminator', function () {
                    let isMatch = schemaEndpoint.validate({
                        body: {
                            bark: 'hav hav',
                            type: 'dog_multiple'
                        },
                        headers: {} });

                    expect(schemaEndpoint.errors.length).to.be.equal(1);
                    expect(schemaEndpoint.errors[0].message).to.equal('should be equal to one of the allowed values');
                    expect(schemaEndpoint.errors[0].dataPath).to.equal('.body.model');
                    expect(schemaEndpoint.errors[0].keyword).to.equal('enum');
                    expect(schemaEndpoint.errors[0].params.allowedValues).to.eql([
                        'small_dog', 'big_dog'
                    ]);
                    expect(isMatch).to.be.false;
                    expect(isMatch).to.be.false;
                });
                it('when discriminator type is dog_multiple and model small_dog and missing root field name and specific plane field', function () {
                    let isMatch = schemaEndpoint.validate({
                        body: {
                            type: 'dog_multiple',
                            model: 'small_dog'
                        },
                        headers: {}
                    });

                    expect(schemaEndpoint.errors.length).to.be.equal(3);
                    expect(schemaEndpoint.errors[0].message).to.equal('should have required property \'max_length\'');
                    expect(schemaEndpoint.errors[1].message).to.equal('should have required property \'name\'');
                    expect(schemaEndpoint.errors[2].message).to.equal('should have required property \'dog_age\'');
                    expect(isMatch).to.be.false;
                });
                it('when valid discriminator type is dog_multiple and model small_dog', function () {
                    let isMatch = schemaEndpoint.validate({
                        body: {
                            name: 'sesna',
                            max_length: 'max_length',
                            dog_age: '3',
                            type: 'dog_multiple',
                            model: 'small_dog'
                        },
                        headers: {}
                    });
                    expect(schemaEndpoint.errors).to.be.equal(null);
                    expect(isMatch).to.be.true;
                });
            });
            describe('discriminator-mapping pet', function () {
                before(function () {
                    schemaEndpoint = schema['/pet-discriminator-mapping']['post'].responses['201'];
                });
                it('missing discriminator field on the root', function () {
                    let isMatch = schemaEndpoint.validate({
                        body: {
                            fur: '6'
                        },
                        headers: {}
                    });

                    expect(schemaEndpoint.errors.length).to.be.equal(1);
                    expect(schemaEndpoint.errors[0].message).to.equal('should be equal to one of the allowed values');
                    expect(schemaEndpoint.errors[0].dataPath).to.equal('.body.type');
                    expect(schemaEndpoint.errors[0].keyword).to.equal('enum');
                    expect(schemaEndpoint.errors[0].params.allowedValues).to.eql([
                        'mapped_dog',
                        'mapped_cat'
                    ]);
                    expect(isMatch).to.be.false;
                });
                it('when discriminator type is mapped_dog and model small_dog and missing root field name and specific dog field', function () {
                    let isMatch = schemaEndpoint.validate({
                        body: {
                            type: 'mapped_dog',
                            model: 'small_dog'
                        },
                        headers: {}
                    });

                    expect(schemaEndpoint.errors.length).to.be.equal(3);
                    expect(schemaEndpoint.errors[0].message).to.equal('should have required property \'max_length\'');
                    expect(schemaEndpoint.errors[0].dataPath).to.equal('.body');
                    expect(schemaEndpoint.errors[0].keyword).to.equal('required');

                    expect(schemaEndpoint.errors[1].message).to.equal('should have required property \'name\'');
                    expect(schemaEndpoint.errors[1].dataPath).to.equal('.body');
                    expect(schemaEndpoint.errors[1].keyword).to.equal('required');

                    expect(schemaEndpoint.errors[2].message).to.equal('should have required property \'dog_age\'');
                    expect(schemaEndpoint.errors[2].dataPath).to.equal('.body');
                    expect(schemaEndpoint.errors[2].keyword).to.equal('required');
                    expect(isMatch).to.be.false;
                });
                it('when valid discriminator type is mapped_dog and model small_dog', function () {
                    let isMatch = schemaEndpoint.validate({
                        body: {
                            name: 'sesna',
                            max_length: 'max_length',
                            dog_age: '200',
                            type: 'mapped_dog',
                            model: 'small_dog'
                        },
                        headers: {} });

                    expect(schemaEndpoint.errors).to.be.equal(null);
                    expect(isMatch).to.be.true;
                });
            });
        });
    });

    describe('check body and headers', () => {
        let schema;
        before(function () {
            const swaggerPath = path.join(__dirname, './pets-response.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, {}).then((receivedSchema) => {
                schema = receivedSchema;
            });
        });
        it('valid body and bad headers validation', function () {
            let schemaEndpoint = schema['/pet']['post'].responses['201'];
            let validatorMatch = schemaEndpoint.validate({ body: {
                fur: '321'
            },
            headers: {
                'x-zooz-request-id': '321'
            } });
            expect(schemaEndpoint.errors).to.be.eql([
                {
                    'dataPath': ".headers['x-zooz-request-id']",
                    'keyword': 'format',
                    'message': 'should match format "uuid"',
                    'params': {
                        'format': 'uuid'
                    },
                    'schemaPath': '#/headers/properties/x-zooz-request-id/format'
                }
            ]);
            expect(validatorMatch).to.be.false;
        });
        it('valid headers and bad body validation', function () {
            let schemaEndpoint = schema['/pet']['post'].responses['201'];
            let validatorMatch = schemaEndpoint.validate({ body: {
                fur: 11
            },
            headers: {
                'x-zooz-request-id': uuid()
            } });
            expect(schemaEndpoint.errors[0].dataPath).to.be.equal('.body');
            expect(schemaEndpoint.errors[0].message).to.be.equal('should have required property \'bark\'');
            expect(schemaEndpoint.errors[1].dataPath).to.be.equal('.body.fur');
            expect(schemaEndpoint.errors[1].message).to.be.equal('should be string');
            expect(schemaEndpoint.errors[2].dataPath).to.be.equal('.body');
            expect(schemaEndpoint.errors[2].message).to.be.equal('should match exactly one schema in oneOf');

            expect(validatorMatch).to.be.false;
        });
        it('bad headers and body validation', function () {
            let schemaEndpoint = schema['/pet']['post'].responses['201'];
            let validatorMatch = schemaEndpoint.validate({ body: {
                fur: 111
            },
            headers: {
                'x-zooz-request-id': 111
            } });

            expect(schemaEndpoint.errors[0].dataPath).to.be.equal('.body');
            expect(schemaEndpoint.errors[0].message).to.be.equal('should have required property \'bark\'');
            expect(schemaEndpoint.errors[1].dataPath).to.be.equal('.body.fur');
            expect(schemaEndpoint.errors[1].message).to.be.equal('should be string');
            expect(schemaEndpoint.errors[2].dataPath).to.be.equal('.body');
            expect(schemaEndpoint.errors[2].message).to.be.equal('should match exactly one schema in oneOf');
            expect(schemaEndpoint.errors[3].dataPath).to.be.equal('.headers[\'x-zooz-request-id\']');
            expect(schemaEndpoint.errors[3].message).to.be.equal('should match format "uuid"');

            expect(validatorMatch).to.be.false;
        });
        it('valid headers and body validation', function () {
            let schemaEndpoint = schema['/pet']['post'].responses['201'];
            let validatorMatch = schemaEndpoint.validate({ body: {
                fur: '321'
            },
            headers: {
                'x-zooz-request-id': uuid()
            } });
            expect(schemaEndpoint.errors).to.be.eql(null);
            expect(validatorMatch).to.be.true;
        });
    });
});
