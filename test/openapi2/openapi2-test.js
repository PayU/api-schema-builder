'use strict';

let chai = require('chai'),
    expect = chai.expect,
    chaiSinon = require('chai-sinon'),
    schemaValidatorGenerator = require('../../src/index'),
    path = require('path'),
    InputValidationError = require('../inputValidationError');

chai.use(chaiSinon);
describe('oas2 check', function () {
    let schema;
    before(function () {
        const swaggerPath = path.join(__dirname, 'pets.yaml');
        return schemaValidatorGenerator.getSchema(swaggerPath, {}).then((receivedSchema) => {
            schema = receivedSchema;
        });
    });
    describe('check headers', function () {
        let schemaEndpoint;
        before(function() {
            schemaEndpoint = schema['/pet-header']['get'];
        });
        it('valid headers', function () {
            // parameters.validate match
            let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
                headers: { 'api-version': '1.0'
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
            expect(schemaEndpoint.parameters.errors).to.be.eql([
                {
                    'dataPath': '.headers',
                    'keyword': 'required',
                    'message': "should have required property 'api-version'",
                    'params': {
                        'missingProperty': 'api-version'
                    },
                    'schemaPath': '#/properties/headers/required'
                }
            ]);
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
    });

    describe('check queries', function () {
        let schemaEndpoint;
        before(function () {
            schemaEndpoint = schema['/pet-query']['get'];
        });
        it('valid query', function () {
            let isParametersMatch = schemaEndpoint.parameters.validate({
                query: { limit: '1' },
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
                    'message': "should have required property 'limit'",
                    'params': {
                        'missingProperty': 'limit'
                    },
                    'schemaPath': '#/properties/query/required'
                }
            ]);
            expect(isParametersMatch).to.be.false;
        });
    });

    describe('check path', function () {
        let schemaEndpoint;
        before(function () {
            schemaEndpoint = schema['/pet-path/:name']['get'];
        });
        it('valid path', function () {
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
    });

    // no tests were written
    describe.skip('check file', function () {});

    describe('check body', function () {
        let schemaEndpoint;
        before(function () {
            schemaEndpoint = schema['/tree']['post'];
        });

        describe('simple body', function () {
            it('valid simple body', function () {
                // body match
                let isBodysMatch = schemaEndpoint.body.validate({
                    name: 'Tree'
                });
                expect(schemaEndpoint.body.errors).to.be.equal(null);
                expect(isBodysMatch).to.be.true;
            });
            it('missing required field in simple body', function () {
                // body match
                let isBodysMatch = schemaEndpoint.body.validate({
                });

                expect(schemaEndpoint.body.errors).to.be.eql([
                    {
                        'dataPath': '',
                        'keyword': 'required',
                        'message': "should have required property 'name'",
                        'params': {
                            'missingProperty': 'name'
                        },
                        'schemaPath': '#/required'
                    }]);
                expect(isBodysMatch).to.be.false;
            });
            it('invalid field type in simple body', function () {
                // body match
                let isBodysMatch = schemaEndpoint.body.validate({
                    'bark': 111
                });

                expect(schemaEndpoint.body.errors).to.be.eql([
                    {
                        'dataPath': '',
                        'keyword': 'required',
                        'message': "should have required property 'name'",
                        'params': {
                            'missingProperty': 'name'
                        },
                        'schemaPath': '#/required'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
        });

        describe('body with discriminator', function () {
            describe('discriminator-pet', function () {
                let schemaEndpoint;
                before(function () {
                    schemaEndpoint = schema['/pet']['post'];
                });
                it('missing discriminator field', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        name: 'name',
                        tag: 'tag',
                        test: {
                            field1: '1234'
                        }
                    });

                    const error = new InputValidationError(schemaEndpoint.body.errors, '/pet-discriminator', 'post',
                        { beautifyErrors: true,
                            firstError: true });
                    expect(error.errors).to.be.equal('body/petType should be equal to one of the allowed values [Cat,Dog]');

                    // expect(schemaEndpoint.body.errors).to.be.equal('["Error: should be equal to one of the allowed values"]');
                    expect(isBodysMatch).to.be.false;
                });
                it('when discriminator type is dog and missing field', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        petType: 'Dog',
                        name: 'name'
                    });
                    expect(schemaEndpoint.body.errors).to.be.eql([
                        {
                            'dataPath': '',
                            'keyword': 'required',
                            'message': "should have required property 'packSize'",
                            'params': {
                                'missingProperty': 'packSize'
                            },
                            'schemaPath': '#/allOf/1/required'
                        }
                    ]);
                    expect(isBodysMatch).to.be.false;
                });
                it('valid complex body', function () {
                    // body match
                    let isBodysMatch = schemaEndpoint.body.validate({
                        petType: 'Dog',
                        name: 'name',
                        packSize: 3
                    });
                    expect(schemaEndpoint.body.errors).to.be.equal(null);
                    expect(isBodysMatch).to.be.true;
                });
            });
        });
    });
});
