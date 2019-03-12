'use strict';

let chai = require('chai'),
    expect = chai.expect,
    chaiSinon = require('chai-sinon'),
    schemaValidatorGenerator = require('../../src/index'),
    path = require('path'),
    InputValidationError = require('../inputValidationError');

chai.use(chaiSinon);
describe('oas2 check - response', function () {
    let schema;
    before(function () {
        const swaggerPath = path.join(__dirname, 'pets-response.yaml');
        return schemaValidatorGenerator.buildSchema(swaggerPath, {}).then((receivedSchema) => {
            schema = receivedSchema;
        });
    });
    describe('check body', function () {
        let schemaEndpoint;
        before(function() {
            //todo - change all request and response endpoint to be (request/response)-only-(header/path/queries/description)
            schemaEndpoint = schema['/dog']['post'].responses;
        });
        it('valid response', function () {
            let isResponseBodyMatch = schemaEndpoint['201'].validate({   body: {
                    petType: 'Dog',
                    name: 'name',
                    packSize: 3
                },
                headers:{
                        'x-next': 123
                    }});

            // let isResponseBodyMatch = schemaEndpoint['201'].validate({   body: {
            //         name: 'name',
            //     },
            // headers:{
            //     'x-next': 123
            // }});
            expect(schemaEndpoint['201'].errors).to.be.equal(null);
            expect(isResponseBodyMatch).to.be.true;
        });

        it('invalid response', function () {

            let isResponseBodyMatch = schemaEndpoint['201'].validate({   body: {
                    petType: 'Dog',
                    packSize: 3
                },
                headers:{
                    'x-neaxt': 123
                }});

            expect(schemaEndpoint['201'].errors).to.be.eql( [
                {
                    "dataPath": ".body",
                    "keyword": "required",
                    "message": "should have required property 'name'",
                    "params": {
                        "missingProperty": "name"
                    },
                    "schemaPath": "#/body/allOf/0/required"
                },
                {
                    "dataPath": ".headers",
                    "keyword": "required",
                    "message": "should have required property 'x-next'",
                    "params": {
                        "missingProperty": "x-next"
                    },
                    "schemaPath": "#/headers/required"
                }
            ]);
            expect(isResponseBodyMatch).to.be.false

            // // parameters.validate match
            // let isResponseBodyMatch = schemaEndpoint['201'].validate({  body:{ petType: 'Dog',
            //     name: 'name'}});
            // expect(schemaEndpoint['201'].errors).to.be.eql( [{
            //     "dataPath": "",
            //     "keyword": "required",
            //     "message": "should have required property 'packSize'",
            //     "params": {
            //         "missingProperty": "packSize"
            //     },
            //     "schemaPath": "#/allOf/1/required"
            // }
        // ]);

            // const error = new InputValidationError(schemaEndpoint.body.errors, '/pet-discriminator', 'post',
            //     { beautifyErrors: true,
            //         firstError: true });
            // expect(error.errors).to.be.equal('body/type should be equal to one of the allowed values [dog_object,cat_object]');

            // expect(isResponseBodyMatch).to.be.false;
        });

        // it('valid headers', function () {
        //
        //     // parameters.validate match
        //     let isResponseBodyMatch = schemaEndpoint['201'].headers.validate({   'x-next': "432"});
        //     expect(schemaEndpoint['201'].headers.errors).to.be.equal(null);
        //     expect(isResponseBodyMatch).to.be.true;
        // });

        // it('invalid body', function () {
        //
        //     // parameters.validate match
        //     let isResponseBodyMatch = schemaEndpoint['201'].body.validate({   petType: 'Dog',
        //         name: 'name'});
        //     expect(schemaEndpoint['201'].body.errors).to.be.eql(  [{
        //         "dataPath": "",
        //         "keyword": "required",
        //         "message": "should have required property 'packSize'",
        //         "params": {
        //             "missingProperty": "packSize"
        //         },
        //         "schemaPath": "#/allOf/1/required"
        //     }
        //     ]);
        //     expect(isResponseBodyMatch).to.be.false;
        // });
        // it('missing required header', function () {
        //     // parameters match
        //     let isParametersMatch = schemaEndpoint.response['201'].validate({ query: {},
        //         headers: { 'host': 'test' },
        //         path: {},
        //         files: undefined });
        //     expect(schemaEndpoint.parameters.errors).to.be.eql([
        //         {
        //             'dataPath': '.headers',
        //             'keyword': 'required',
        //             'message': "should have required property 'api-version'",
        //             'params': {
        //                 'missingProperty': 'api-version'
        //             },
        //             'schemaPath': '#/properties/headers/required'
        //         }
        //     ]);
        //     expect(isParametersMatch).to.be.false;
        // });
        // it('invalid type for headers', function () {
        //     // parameters match
        //     let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
        //         headers: 3,
        //         path: {},
        //         files: undefined });
        //     expect(schemaEndpoint.parameters.errors).to.be.eql([{
        //         'dataPath': '.headers',
        //         'keyword': 'type',
        //         'message': 'should be object',
        //         'params': {
        //             'type': 'object'
        //         },
        //         'schemaPath': '#/properties/headers/type'
        //     }]);
        //     expect(isParametersMatch).to.be.false;
        // });
    });

    describe.skip('check queries', function () {
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

    describe.skip('check path', function () {
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

    describe.skip('check body', function () {
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
