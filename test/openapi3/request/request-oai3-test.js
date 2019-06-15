'use strict';

let chai = require('chai'),
    expect = chai.expect,
    schemaValidatorGenerator = require('../../../src/index'),
    path = require('path'),
    uuid = require('uuid');

describe('oai3 - request tests', function () {
    let schema;
    before(function () {
        const swaggerPath = path.join(__dirname, 'pets-request.yaml');
        schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
    });
    describe('check headers', function () {
        let schemaEndpoint;
        before(function() {
            schemaEndpoint = schema['/pet']['post'];
        });
        it('valid headers', function () {
            // parameters match
            let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
                headers: { 'public-key': '1.0'
                },
                path: {},
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.equal(null);
            expect(isParametersMatch).to.be.true;
        });
        it('missing required header', function () {
            // parameters match
            let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
                headers: { 'host': 'test' },
                path: {},
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.eql([{
                'dataPath': '.headers',
                'keyword': 'required',
                'message': "should have required property 'public-key'",
                'params': {
                    'missingProperty': 'public-key'
                },
                'schemaPath': '#/properties/headers/required'
            }]);
            expect(isParametersMatch).to.be.false;
        });

        it('invalid type for headers', function () {
            // parameters match
            let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
                headers: 3,
                path: {},
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.eql([{
                'dataPath': '.headers',
                'keyword': 'type',
                'message': 'should be object',
                'params': {
                    'type': 'object'
                },
                'schemaPath': '#/properties/headers/type'
            }]);
            expect(isParametersMatch).to.be.false;
        });

        it('invalid format for headers', function () {
            // parameters match
            let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
                headers: { 'public-key': '1.0',
                    'header_uuid': '321' },
                path: {},
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.eql([
                {
                    'dataPath': '.headers.header_uuid',
                    'keyword': 'format',
                    'message': 'should match format "uuid"',
                    'params': {
                        'format': 'uuid'
                    },
                    'schemaPath': '#/properties/headers/properties/header_uuid/format'
                }
            ]);
            expect(isParametersMatch).to.be.false;
        });

        it('valid format for headers', function () {
            // parameters match
            let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
                headers: { 'public-key': '1.0',
                    'header_uuid': uuid() },
                path: {},
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.eql(null);
            expect(isParametersMatch).to.be.true;
        });
    });

    describe('check queries', function () {
        let schemaEndpoint;
        before(function () {
            schemaEndpoint = schema['/pets-query']['get'];
        });
        it('valid query', function () {
            let isParametersMatch = schemaEndpoint.parameters.validate({
                query: { page: '1' },
                headers: {},
                path: {},
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.equal(null);
            expect(isParametersMatch).to.be.true;
        });
        it('missing required query', function () {
            let isParametersMatch = schemaEndpoint.parameters.validate({
                query: { wrong_query: 'nothing' },
                headers: {},
                path: {},
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.eql([
                {
                    'dataPath': '.query',
                    'keyword': 'additionalProperties',
                    'message': 'should NOT have additional properties',
                    'params': {
                        'additionalProperty': 'wrong_query'
                    },
                    'schemaPath': '#/properties/query/additionalProperties'
                },
                {
                    'dataPath': '.query',
                    'keyword': 'required',
                    'message': "should have required property 'page'",
                    'params': {
                        'missingProperty': 'page'
                    },
                    'schemaPath': '#/properties/query/required'
                }
            ]);
            expect(isParametersMatch).to.be.false;
        });

        it('valid format query', function () {
            let isParametersMatch = schemaEndpoint.parameters.validate({
                query: { page: '1', 'query_uuid': uuid() },
                headers: {},
                path: {},
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.equal(null);
            expect(isParametersMatch).to.be.true;
        });

        it('invalid format query', function () {
            let isParametersMatch = schemaEndpoint.parameters.validate({
                query: { page: '1', 'query_uuid': 321 },
                headers: {},
                path: {},
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.eql([
                {
                    'dataPath': '.query.query_uuid',
                    'keyword': 'format',
                    'message': 'should match format "uuid"',
                    'params': {
                        'format': 'uuid'
                    },
                    'schemaPath': '#/properties/query/properties/query_uuid/format'
                }
            ]);
            expect(isParametersMatch).to.be.false;
        });
    });

    describe('check path', function () {
        it('valid path param', function () {
            let schemaEndpoint = schema['/pets-path/:name']['get'];
            // parameters match
            let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
                headers: { 'public-key': '1.0'
                },
                path: { name: 'kitty' },
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.equal(null);
            expect(isParametersMatch).to.be.true;
        });
        it('missing required path', function () {
            let schemaEndpoint = schema['/pets-path/:name']['get'];

            // parameters match
            let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
                headers: { 'host': 'test' },
                path: { namee: 'kitty' },
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.eql([
                {
                    'dataPath': '.path',
                    'keyword': 'additionalProperties',
                    'message': 'should NOT have additional properties',
                    'params': {
                        'additionalProperty': 'namee'
                    },
                    'schemaPath': '#/properties/path/additionalProperties'
                },
                {
                    'dataPath': '.path',
                    'keyword': 'required',
                    'message': "should have required property 'name'",
                    'params': {
                        'missingProperty': 'name'
                    },
                    'schemaPath': '#/properties/path/required'
                }
            ]);
            expect(isParametersMatch).to.be.false;
        });

        it('valid path param format', function () {
            let schemaEndpoint = schema['/pets/:pet_id']['get'];
            // parameters match
            let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
                headers: { },
                path: { pet_id: uuid() },
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.equal(null);
            expect(isParametersMatch).to.be.true;
        });

        it('invalid path param format', function () {
            let schemaEndpoint = schema['/pets/:pet_id']['get'];
            // parameters match
            let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
                headers: { },
                path: { pet_id: 321 },
                files: undefined });
            expect(schemaEndpoint.parameters.errors).to.be.eql([
                {
                    'dataPath': '.path.pet_id',
                    'keyword': 'format',
                    'message': 'should match format "uuid"',
                    'params': {
                        'format': 'uuid'
                    },
                    'schemaPath': '#/properties/path/properties/pet_id/format'
                }
            ]);
            expect(isParametersMatch).to.be.false;
        });
    });

    // no tests were written
    describe.skip('check file', function () {});

    describe('check body', function () {
        describe('simple body', function () {
            it('valid simple body', function () {
                let schemaEndpoint = schema['/dog']['post'];
                let isBodysMatch = schemaEndpoint.body.validate({
                    'bark': 'hav hav'
                });
                expect(schemaEndpoint.body.errors).to.be.equal(null);
                expect(isBodysMatch).to.be.true;
            });
            it('missing required field in simple body', function () {
                let schemaEndpoint = schema['/dog']['post'];

                let isBodysMatch = schemaEndpoint.body.validate({
                    'fur': 'hav hav'
                });

                expect(schemaEndpoint.body.errors).to.be.eql([
                    {
                        'dataPath': '',
                        'keyword': 'required',
                        'message': "should have required property 'bark'",
                        'params': {
                            'missingProperty': 'bark'
                        },
                        'schemaPath': '#/required'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
            it('invalid field type in simple body', function () {
                let schemaEndpoint = schema['/dog']['post'];

                let isBodysMatch = schemaEndpoint.body.validate({
                    'bark': 111
                });

                expect(schemaEndpoint.body.errors).to.be.eql([
                    {
                        'dataPath': '.bark',
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/properties/bark/type'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
            it('valid body - quantitive test', function () {
                let schemaEndpoint = schema['/many-body-fields']['post'];

                let isBodysMatch = schemaEndpoint.body.validate({ 'fieldNum1': 1,
                    'fieldNum2': 2,
                    'fieldNum3': 3,
                    'fieldStr1': 'name1',
                    'fieldStr2': 'name2',
                    'fieldStr3': 'name3' });

                expect(schemaEndpoint.body.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
            it('invalid body - quantitive test', function () {
                let schemaEndpoint = schema['/many-body-fields']['post'];

                let isBodysMatch = schemaEndpoint.body.validate({ 'fieldNum1': 'name1', 'fieldNum2': 'name2', 'fieldNum3': 'name3', 'fieldStr1': 1, 'fieldStr2': 2, 'fieldStr3': 3 });

                expect(schemaEndpoint.body.errors).to.be.eql([
                    {
                        'keyword': 'type',
                        'dataPath': '.fieldNum1',
                        'schemaPath': '#/properties/fieldNum1/type',
                        'params': {
                            'type': 'number'
                        },
                        'message': 'should be number'
                    },
                    {
                        'keyword': 'type',
                        'dataPath': '.fieldNum2',
                        'schemaPath': '#/properties/fieldNum2/type',
                        'params': {
                            'type': 'number'
                        },
                        'message': 'should be number'
                    },
                    {
                        'keyword': 'type',
                        'dataPath': '.fieldNum3',
                        'schemaPath': '#/properties/fieldNum3/type',
                        'params': {
                            'type': 'number'
                        },
                        'message': 'should be number'
                    },
                    {
                        'keyword': 'type',
                        'dataPath': '.fieldStr1',
                        'schemaPath': '#/properties/fieldStr1/type',
                        'params': {
                            'type': 'string'
                        },
                        'message': 'should be string'
                    },
                    {
                        'keyword': 'type',
                        'dataPath': '.fieldStr2',
                        'schemaPath': '#/properties/fieldStr2/type',
                        'params': {
                            'type': 'string'
                        },
                        'message': 'should be string'
                    },
                    {
                        'keyword': 'type',
                        'dataPath': '.fieldStr3',
                        'schemaPath': '#/properties/fieldStr3/type',
                        'params': {
                            'type': 'string'
                        },
                        'message': 'should be string'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
        });
        describe('anyOf body', function () {
            let schemaEndpoint;
            before(function () {
                schemaEndpoint = schema['/pet-any-of']['post'].body;
            });
            it('valid full body', function () {
                let isMatch = schemaEndpoint.validate(
                    {
                        'bark': 'hav hav',
                        'fur': 1
                    });
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(isMatch).to.be.true;
            });

            it('missing required field in body', function () {
                let isMatch = schemaEndpoint.validate({ });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '',
                        'keyword': 'required',
                        'message': "should have required property 'bark'",
                        'params': {
                            'missingProperty': 'bark'
                        },
                        'schemaPath': '#/anyOf/0/required'
                    },
                    {
                        'dataPath': '',
                        'keyword': 'required',
                        'message': "should have required property 'fur'",
                        'params': {
                            'missingProperty': 'fur'
                        },
                        'schemaPath': '#/anyOf/1/required'
                    },
                    {
                        'dataPath': '',
                        'keyword': 'anyOf',
                        'message': 'should match some schema in anyOf',
                        'params': {},
                        'schemaPath': '#/anyOf'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
            it('invalid field type in body', function () {
                let isMatch = schemaEndpoint.validate({
                    'bark': 111,
                    'fur': 'wrong'
                });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.bark',
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/anyOf/0/properties/bark/type'
                    },
                    {
                        'dataPath': '.fur',
                        'keyword': 'pattern',
                        'message': 'should match pattern "^\\d+$"',
                        'params': {
                            'pattern': '^\\d+$'
                        },
                        'schemaPath': '#/anyOf/1/properties/fur/pattern'
                    },
                    {
                        'dataPath': '',
                        'keyword': 'anyOf',
                        'message': 'should match some schema in anyOf',
                        'params': {},
                        'schemaPath': '#/anyOf'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
        });
        describe('allOf body', function () {
            let schemaEndpoint;

            before(function () {
                schemaEndpoint = schema['/pet-all-of']['post'].body;
            });
            it('valid full body', function () {
                let isMatch = schemaEndpoint.validate({
                    'bark': 'hav hav',
                    'fur': '11'
                });
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(isMatch).to.be.true;
            });
            it('missing required field in body', function () {
                let isMatch = schemaEndpoint.validate({
                    'bark': 'hav hav'
                });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '',
                        'keyword': 'required',
                        'message': "should have required property 'fur'",
                        'params': {
                            'missingProperty': 'fur'
                        },
                        'schemaPath': '#/allOf/1/required'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
            it('invalid field type in body', function () {
                let isMatch = schemaEndpoint.validate({
                    'bark': 111,
                    'fur': 'wrong'
                });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.bark',
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/allOf/0/properties/bark/type'
                    },
                    {
                        'dataPath': '.fur',
                        'keyword': 'pattern',
                        'message': 'should match pattern "^\\d+$"',
                        'params': {
                            'pattern': '^\\d+$'
                        },
                        'schemaPath': '#/allOf/1/properties/fur/pattern'
                    }
                ]);
                expect(isMatch).to.be.false;
            });
        });
        describe('body with discriminator', function () {
            describe('discriminator-pet', function () {
                let schemaEndpoint;
                before(function () {
                    schemaEndpoint = schema['/pet-discriminator']['post'];
                });
                it('missing discriminator field', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        'bark': 'hav hav'
                    });

                    expect(schemaEndpoint.body.errors[0].message).to.equal('should be equal to one of the allowed values');
                    expect(schemaEndpoint.body.errors[0].dataPath).to.equal('.type');
                    expect(schemaEndpoint.body.errors[0].keyword).to.equal('enum');
                    expect(schemaEndpoint.body.errors[0].params.allowedValues).to.eql([
                        'dog_object',
                        'cat_object'
                    ]);
                    expect(isBodysMatch).to.be.false;
                });
                it('when discriminator type is dog and missing field', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        'type': 'dog_object'
                    });
                    expect(schemaEndpoint.body.errors).to.be.eql([
                        {
                            'dataPath': '',
                            'keyword': 'required',
                            'message': "should have required property 'bark'",
                            'params': {
                                'missingProperty': 'bark'
                            },
                            'schemaPath': '#/required'
                        }
                    ]);
                    expect(isBodysMatch).to.be.false;
                });
                it('valid complex body', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        bark: 'hav hav',
                        type: 'dog_object'
                    });
                    expect(schemaEndpoint.body.errors).to.be.equal(null);
                    expect(isBodysMatch).to.be.true;
                });
            });
            describe('discriminator-multiple pet', function () {
                let schemaEndpoint;
                before(function () {
                    schemaEndpoint = schema['/pet-discriminator-multiple']['post'];
                });
                it('missing discriminator field', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        'fur': 'hav hav'
                    });

                    expect(schemaEndpoint.body.errors[0].message).to.equal('should be equal to one of the allowed values');
                    expect(schemaEndpoint.body.errors[0].dataPath).to.equal('.type');
                    expect(schemaEndpoint.body.errors[0].keyword).to.equal('enum');
                    expect(schemaEndpoint.body.errors[0].params.allowedValues).to.eql([
                        'dog_multiple',
                        'cat_object'
                    ]);
                    expect(isBodysMatch).to.be.false;
                    expect(isBodysMatch).to.be.false;
                });
                it('missing discriminator field on the on inside discriminator', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        bark: 'hav hav',
                        type: 'dog_multiple'
                    });

                    expect(schemaEndpoint.body.errors[0].message).to.equal('should be equal to one of the allowed values');
                    expect(schemaEndpoint.body.errors[0].dataPath).to.equal('.model');
                    expect(schemaEndpoint.body.errors[0].keyword).to.equal('enum');
                    expect(schemaEndpoint.body.errors[0].params.allowedValues).to.eql([
                        'small_dog', 'big_dog'
                    ]);
                    expect(isBodysMatch).to.be.false;
                    expect(isBodysMatch).to.be.false;
                });
                it('when discriminator type is dog_multiple and model small_dog and missing root field name and specific plane field', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        type: 'dog_multiple',
                        model: 'small_dog'
                    });

                    expect(schemaEndpoint.body.errors[0].message).to.equal('should have required property \'max_length\'');
                    expect(schemaEndpoint.body.errors[1].message).to.equal('should have required property \'name\'');
                    expect(schemaEndpoint.body.errors[2].message).to.equal('should have required property \'dog_age\'');
                    expect(isBodysMatch).to.be.false;
                });
                it('when valid discriminator type is dog_multiple and model small_dog', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        name: 'sesna',
                        max_length: 'max_length',
                        dog_age: '3',
                        type: 'dog_multiple',
                        model: 'small_dog'
                    });
                    expect(schemaEndpoint.body.errors).to.be.equal(null);
                    expect(isBodysMatch).to.be.true;
                });
            });
            describe('discriminator-mapping pet', function () {
                let schemaEndpoint;
                before(function () {
                    schemaEndpoint = schema['/pet-discriminator-mapping']['post'];
                });
                it('missing discriminator field on the root', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        fur: '6'
                    });

                    expect(schemaEndpoint.body.errors[0].message).to.equal('should be equal to one of the allowed values');
                    expect(schemaEndpoint.body.errors[0].dataPath).to.equal('.type');
                    expect(schemaEndpoint.body.errors[0].keyword).to.equal('enum');
                    expect(schemaEndpoint.body.errors[0].params.allowedValues).to.eql([
                        'mapped_dog',
                        'mapped_cat'
                    ]);
                    expect(isBodysMatch).to.be.false;
                });
                it('when discriminator type is mapped_dog and model small_dog and missing root field name and specific dog field', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        type: 'mapped_dog',
                        model: 'small_dog'
                    });

                    expect(schemaEndpoint.body.errors[0].message).to.equal('should have required property \'max_length\'');
                    expect(schemaEndpoint.body.errors[0].dataPath).to.equal('');
                    expect(schemaEndpoint.body.errors[0].keyword).to.equal('required');
                    expect(isBodysMatch).to.be.false;
                });
                it('when valid discriminator type is mapped_dog and model small_dog', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        name: 'sesna',
                        max_length: 'max_length',
                        dog_age: '200',
                        type: 'mapped_dog',
                        model: 'small_dog'
                    });

                    expect(schemaEndpoint.body.errors).to.be.equal(null);
                    expect(isBodysMatch).to.be.true;
                });
            });
        });
    });
});
