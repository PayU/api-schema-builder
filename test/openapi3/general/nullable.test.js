'use strict';

const chai = require('chai');
const expect = chai.expect;
const schemaValidatorGenerator = require('../../../src/index');
const path = require('path');

describe('oai3 - nullable', function () {
    let schema;
    before(function () {
        const swaggerPath = path.join(__dirname, 'nullable.yaml');
        schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
    });
    describe('validate nullable in request', function () {
        it('Should return error when request body has nullable and required prop', function () {
            const validator = schema['/users']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                'id': 'hav hav',
                'hav': 'jav',
                'name': null
            });

            expect(validator.errors).to.be.eql([
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
    });
    describe('validate nullable in response', function () {
        it('Should return error when response body has nullable and required prop', function () {
            const validator = schema['/users']['post'].responses[200];

            const isBodysMatch = validator.validate({
                headers: {
                    'content-type': 'application/json'
                },
                body: {
                    password: 'dsadas',
                    name: null
                }
            });

            expect(validator.errors).to.be.eql([
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
        it('Should return error when request body has nullable', function () {
            const validator = schema['/users/nested']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                user: {
                    'id': 'hav hav',
                    'email': 'user@doamin.com',
                    'hav': 'jav',
                    'name': null
                }
            });

            expect(validator.errors).to.be.eql([
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
    });
    describe('Validate nested object in array', function () {
        it('Should return error when request body has nullable', function () {
            const validator = schema['/users/usersArray']['post'].body['application/json'];

            const isBodysMatch = validator.validate([
                {
                    'id': 'hav hav',
                    'email': 'user@doamin.com',
                    'hav': 'jav',
                    'name': null
                }
            ]);

            expect(validator.errors).to.be.eql([
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
    });
    describe('Validate oneOf', function () {
        it('Should return error when request body has nullable', function () {
            const validator = schema['/users/OneOf']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                'id': 'hav hav',
                'email': 'user@doamin.com',
                'hav': 'jav',
                'name': null
            });

            expect(validator.errors).to.be.eql([
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
    });
});
