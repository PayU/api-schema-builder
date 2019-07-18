'use strict';

const chai = require('chai');
const expect = chai.expect;
const schemaValidatorGenerator = require('../../../src/index');
const path = require('path');

describe.only('oai3 - readOnly/writeOnly', function () {
    let schema;
    before(function () {
        const swaggerPath = path.join(__dirname, 'readOnlyWriteOnly.yaml');
        schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
    });
    describe('validate readOnly in request', function () {
        it('Should return error when request body has readOnly and required prop', function () {
            let validator = schema['/users/required']['post'].body['application/json'];

            let isBodysMatch = validator.validate({
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
            let validator = schema['/users/optional']['post'].body['application/json'];

            let isBodysMatch = validator.validate({
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
            let validator = schema['/users/required']['post'].responses[200];

            let isBodysMatch = validator.validate({
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
            let validator = schema['/users/optional']['post'].responses[200];

            let isBodysMatch = validator.validate({
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
            let validator = schema['/users/utf8']['post'].body['application/json;utf8'];

            let isBodysMatch = validator.validate({
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
            let validator = schema['/users/utf8']['post'].responses[200];

            let isBodysMatch = validator.validate({
                headers: {
                    'content-type': 'application/json;utf8'
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
            let validator = schema['/users/nested']['post'].body['application/json'];

            let isBodysMatch = validator.validate({
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
            let validator = schema['/users/nested']['post'].responses[200];

            let isBodysMatch = validator.validate({
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
            let validator = schema['/users/usersArray']['post'].body['application/json'];

            let isBodysMatch = validator.validate([
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
            let validator = schema['/users/usersArray']['post'].responses[200];

            let isBodysMatch = validator.validate({
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
});
