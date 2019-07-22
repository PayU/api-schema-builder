'use strict';

const chai = require('chai');
const expect = chai.expect;
const schemaValidatorGenerator = require('../../../src/index');
const path = require('path');

describe('oai3 - readOnly/writeOnly', function () {
    let schema;
    before(function () {
        const swaggerPath = path.join(__dirname, 'readOnlyWriteOnly.yaml');
        schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
    });
    describe('validate readOnly in request', function () {
        it('Should return error when request body has readOnly and required prop', function () {
            const validator = schema['/users/required']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                'id': 'hav hav',
                'hav': 'jav'
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/additionalProperties',
                    params: { additionalProperty: 'hav' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/required',
                    params: { missingProperty: 'email' },
                    message: 'should have required property \'email\''
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/required',
                    params: { missingProperty: 'password' },
                    message: 'should have required property \'password\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
        it('Should return error when request body has readOnly and not-required prop', function () {
            const validator = schema['/users/optional']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                'id': 'hav hav',
                'hav': 'jav'
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/additionalProperties',
                    params: { additionalProperty: 'hav' },
                    message: 'should NOT have additional properties'
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
    });
    describe('validate writeOnly in response', function () {
        it('Should return error when response body has writeOnly and required prop', function () {
            const validator = schema['/users/required']['post'].responses[200];

            const isBodysMatch = validator.validate({
                headers: {
                    'content-type': 'application/json'
                },
                body: {
                    password: 'dsadas'
                }
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.body',
                    schemaPath: '#/body/additionalProperties',
                    params: { additionalProperty: 'password' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/required',
                    params: { missingProperty: 'id' },
                    message: 'should have required property \'id\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/required',
                    params: { missingProperty: 'email' },
                    message: 'should have required property \'email\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
        it('Should return error when response body has writeOnly and not-required prop', function () {
            const validator = schema['/users/optional']['post'].responses[200];

            const isBodysMatch = validator.validate({
                headers: {
                    'content-type': 'application/json'
                },
                body: {
                    password: 'dsadas'
                }
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.body',
                    schemaPath: '#/body/additionalProperties',
                    params: { additionalProperty: 'password' },
                    message: 'should NOT have additional properties'
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
    });
    describe('Validate for non-json content-type', function () {
        it('Should return error when request body has readOnly', function () {
            const validator = schema['/users/hal']['post'].body['application/hal+json'];

            const isBodysMatch = validator.validate({
                'id': 'hav hav',
                'hav': 'jav'
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/additionalProperties',
                    params: { additionalProperty: 'hav' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/required',
                    params: { missingProperty: 'email' },
                    message: 'should have required property \'email\''
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/required',
                    params: { missingProperty: 'password' },
                    message: 'should have required property \'password\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
        it('Should return error when response body has writeOnly', function () {
            const validator = schema['/users/hal']['post'].responses[200];

            const isBodysMatch = validator.validate({
                headers: {
                    'content-type': 'application/hal+json'
                },
                body: {
                    password: 'dsadas'
                }
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.body',
                    schemaPath: '#/body/additionalProperties',
                    params: { additionalProperty: 'password' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/required',
                    params: { missingProperty: 'id' },
                    message: 'should have required property \'id\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/required',
                    params: { missingProperty: 'email' },
                    message: 'should have required property \'email\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
    });
    describe('Validate nested objects', function () {
        it('Should return error when request body has readOnly', function () {
            const validator = schema['/users/nested']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                user: {
                    'id': 'hav hav',
                    'email': 'user@doamin.com',
                    'hav': 'jav'
                }
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.user',
                    schemaPath: '#/properties/user/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'additionalProperties',
                    dataPath: '.user',
                    schemaPath: '#/properties/user/additionalProperties',
                    params: { additionalProperty: 'hav' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '.user',
                    schemaPath: '#/properties/user/required',
                    params: { missingProperty: 'password' },
                    message: 'should have required property \'password\''
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/required',
                    params: { missingProperty: 'count' },
                    message: 'should have required property \'count\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
        it('Should return error when response body has writeOnly', function () {
            const validator = schema['/users/nested']['post'].responses[200];

            const isBodysMatch = validator.validate({
                headers: {
                    'content-type': 'application/json'
                },
                body: {
                    user: {
                        password: 'dsadas'
                    }
                }
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.body.user',
                    schemaPath: '#/body/properties/user/additionalProperties',
                    params: { additionalProperty: 'password' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '.body.user',
                    schemaPath: '#/body/properties/user/required',
                    params: { missingProperty: 'id' },
                    message: 'should have required property \'id\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body.user',
                    schemaPath: '#/body/properties/user/required',
                    params: { missingProperty: 'email' },
                    message: 'should have required property \'email\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/required',
                    params: { missingProperty: 'count' },
                    message: 'should have required property \'count\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
    });
    describe('Validate nested object in array', function () {
        it('Should return error when request body has readOnly', function () {
            const validator = schema['/users/usersArray']['post'].body['application/json'];

            const isBodysMatch = validator.validate([
                {
                    'id': 'hav hav',
                    'email': 'user@doamin.com',
                    'hav': 'jav'
                }
            ]);

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '[0]',
                    schemaPath: '#/items/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'additionalProperties',
                    dataPath: '[0]',
                    schemaPath: '#/items/additionalProperties',
                    params: { additionalProperty: 'hav' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '[0]',
                    schemaPath: '#/items/required',
                    params: { missingProperty: 'password' },
                    message: 'should have required property \'password\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
        it('Should return error when response body has writeOnly', function () {
            const validator = schema['/users/usersArray']['post'].responses[200];

            const isBodysMatch = validator.validate({
                headers: {
                    'content-type': 'application/json'
                },
                body: [
                    {
                        password: 'dsadas'
                    }
                ]
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.body[0]',
                    schemaPath: '#/body/items/additionalProperties',
                    params: { additionalProperty: 'password' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '.body[0]',
                    schemaPath: '#/body/items/required',
                    params: { missingProperty: 'id' },
                    message: 'should have required property \'id\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body[0]',
                    schemaPath: '#/body/items/required',
                    params: { missingProperty: 'email' },
                    message: 'should have required property \'email\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
    });
    describe('Validate oneOf', function () {
        it('Should return error when request body has readOnly', function () {
            const validator = schema['/users/OneOf']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                'id': 'hav hav',
                'email': 'user@doamin.com',
                'hav': 'jav'
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/oneOf/0/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/oneOf/0/additionalProperties',
                    params: { additionalProperty: 'hav' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/oneOf/0/required',
                    params: { missingProperty: 'password' },
                    message: 'should have required property \'password\''
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/oneOf/1/required',
                    params: { missingProperty: 'additionalOneOfField' },
                    message: 'should have required property \'additionalOneOfField\''
                },
                {
                    keyword: 'oneOf',
                    dataPath: '',
                    schemaPath: '#/oneOf',
                    params: { passingSchemas: null },
                    message: 'should match exactly one schema in oneOf'
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
        it('Should return error when response body has writeOnly', function () {
            const validator = schema['/users/OneOf']['post'].responses[200];

            const isBodysMatch = validator.validate({
                headers: {
                    'content-type': 'application/json'
                },
                body: {
                    password: 'dsadas'
                }
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.body',
                    schemaPath: '#/body/oneOf/0/additionalProperties',
                    params: { additionalProperty: 'password' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/oneOf/0/required',
                    params: { missingProperty: 'id' },
                    message: 'should have required property \'id\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/oneOf/0/required',
                    params: { missingProperty: 'email' },
                    message: 'should have required property \'email\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/oneOf/1/required',
                    params: { missingProperty: 'additionalOneOfField' },
                    message: 'should have required property \'additionalOneOfField\''
                },
                {
                    keyword: 'oneOf',
                    dataPath: '.body',
                    schemaPath: '#/body/oneOf',
                    params: { passingSchemas: null },
                    message: 'should match exactly one schema in oneOf'
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
    });
    describe('Validate anyOf', function () {
        it('Should return error when request body has readOnly', function () {
            const validator = schema['/users/AnyOf']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                'id': 'hav hav',
                'email': 'user@doamin.com',
                'hav': 'jav'
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/anyOf/0/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/anyOf/0/additionalProperties',
                    params: { additionalProperty: 'hav' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/anyOf/0/required',
                    params: { missingProperty: 'password' },
                    message: 'should have required property \'password\''
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/anyOf/1/required',
                    params: { missingProperty: 'additionalOneOfField' },
                    message: 'should have required property \'additionalOneOfField\''
                },
                {
                    keyword: 'anyOf',
                    dataPath: '',
                    schemaPath: '#/anyOf',
                    params: {},
                    message: 'should match some schema in anyOf'
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
        it('Should return error when response body has writeOnly', function () {
            const validator = schema['/users/AnyOf']['post'].responses[200];

            const isBodysMatch = validator.validate({
                headers: {
                    'content-type': 'application/json'
                },
                body: {
                    password: 'dsadas'
                }
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.body',
                    schemaPath: '#/body/anyOf/0/additionalProperties',
                    params: { additionalProperty: 'password' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/anyOf/0/required',
                    params: { missingProperty: 'id' },
                    message: 'should have required property \'id\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/anyOf/0/required',
                    params: { missingProperty: 'email' },
                    message: 'should have required property \'email\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/anyOf/1/required',
                    params: { missingProperty: 'additionalOneOfField' },
                    message: 'should have required property \'additionalOneOfField\''
                },
                {
                    keyword: 'anyOf',
                    dataPath: '.body',
                    schemaPath: '#/body/anyOf',
                    params: {},
                    message: 'should match some schema in anyOf'
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
    });
    describe('Validate allOf', function () {
        it('Should return error when request body has readOnly', function () {
            const validator = schema['/users/AllOf']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                'id': 'hav hav',
                'email': 'user@doamin.com',
                'hav': 'jav'
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/allOf/0/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/allOf/0/additionalProperties',
                    params: { additionalProperty: 'hav' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/allOf/0/required',
                    params: { missingProperty: 'password' },
                    message: 'should have required property \'password\''
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/allOf/1/required',
                    params: { missingProperty: 'additionalOneOfField' },
                    message: 'should have required property \'additionalOneOfField\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
        it('Should return error when response body has writeOnly', function () {
            const validator = schema['/users/AllOf']['post'].responses[200];

            const isBodysMatch = validator.validate({
                headers: {
                    'content-type': 'application/json'
                },
                body: {
                    password: 'dsadas'
                }
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.body',
                    schemaPath: '#/body/allOf/0/additionalProperties',
                    params: { additionalProperty: 'password' },
                    message: 'should NOT have additional properties'
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/allOf/0/required',
                    params: { missingProperty: 'id' },
                    message: 'should have required property \'id\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/allOf/0/required',
                    params: { missingProperty: 'email' },
                    message: 'should have required property \'email\''
                },
                {
                    keyword: 'required',
                    dataPath: '.body',
                    schemaPath: '#/body/allOf/1/required',
                    params: { missingProperty: 'additionalOneOfField' },
                    message: 'should have required property \'additionalOneOfField\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
    });
});
