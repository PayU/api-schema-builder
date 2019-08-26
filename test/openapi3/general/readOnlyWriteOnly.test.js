'use strict';

const chai = require('chai');
const expect = chai.expect;
const schemaValidatorGenerator = require('../../../src/index');
const path = require('path');

const password = 'qwerty';
const email = 'email@domain.com';
const id = '1';
describe('oai3 - readOnly/writeOnly', function () {
    let schema;
    before(function () {
        const swaggerPath = path.join(__dirname, 'readOnlyWriteOnly.yaml');
        schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
    });
    describe('readOnly', function () {
        describe('request', function () {
            it('Should not return error on missing property', function () {
                const validator = schema['/users/required']['post'].body['application/json'];

                const isBodysMatch = validator.validate({
                    email,
                    password
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
            it('Should return error when sending readOnly property', function () {
                const validator = schema['/users/required']['post'].body['application/json'];

                const isBodysMatch = validator.validate({
                    id,
                    email,
                    password
                });

                expect(validator.errors).to.be.eql([
                    {
                        keyword: 'additionalProperties',
                        dataPath: '',
                        schemaPath: '#/additionalProperties',
                        params: { additionalProperty: 'id' },
                        message: 'should NOT have additional properties'
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
        });
        describe('response', function () {
            it('Should return error on missing required property', function () {
                const validator = schema['/users/required']['post'].responses[200];

                const isBodysMatch = validator.validate({
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: {
                        email
                    }
                });

                expect(validator.errors).to.be.eql([
                    {
                        keyword: 'required',
                        dataPath: '.body',
                        schemaPath: '#/body/required',
                        params: { missingProperty: 'id' },
                        message: 'should have required property \'id\''
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
            it('Should not return error on missing optional property', function () {
                const validator = schema['/users/optional']['post'].responses[200];

                const isBodysMatch = validator.validate({
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: {
                        email
                    }
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
        });
    });
    describe('writeOnly', function () {
        describe('request', function () {
            it('Should return error on missing required property', function () {
                const validator = schema['/users/required']['post'].body['application/json'];

                const isBodysMatch = validator.validate({
                    email
                });

                expect(validator.errors).to.be.eql([
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
            it('Should not return error on missing optional property', function () {
                const validator = schema['/users/optional']['post'].body['application/json'];

                const isBodysMatch = validator.validate({
                    email
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
        });

        describe('response', function () {
            it('Should not return error on missing required property ', function () {
                const validator = schema['/users/required']['post'].responses[200];

                const isBodysMatch = validator.validate({
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: {
                        id,
                        email
                    }
                });

                expect(validator.errors).to.be.eql(null);
                expect(isBodysMatch).to.be.true;
            });
            it('Should return error when sending writeOnly property', function () {
                const validator = schema['/users/optional']['post'].responses[200];

                const isBodysMatch = validator.validate({
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: {
                        email,
                        password
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
    });

    describe('Validate for non-json content-type', function () {
        it('Should return error when request body has readOnly', function () {
            const validator = schema['/users/hal']['post'].body['application/hal+json'];

            const isBodysMatch = validator.validate({
                id,
                email,
                password
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '',
                    schemaPath: '#/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
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
                    id,
                    email,
                    password
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
    describe('Validate nested objects', function () {
        it('Should return error when request body has readOnly', function () {
            const validator = schema['/users/nested']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                user: {
                    id,
                    email,
                    password
                }
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.user',
                    schemaPath: '#/properties/user/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
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
                        id,
                        email,
                        password
                    },
                    lastLogin: new Date().getTime()
                }
            });

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '.body.user',
                    schemaPath: '#/body/properties/user/additionalProperties',
                    params: { additionalProperty: 'password' },
                    message: 'should NOT have additional properties'
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
                    id,
                    email,
                    password
                }
            ]);

            expect(validator.errors).to.be.eql([
                {
                    keyword: 'additionalProperties',
                    dataPath: '[0]',
                    schemaPath: '#/items/additionalProperties',
                    params: { additionalProperty: 'id' },
                    message: 'should NOT have additional properties'
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
                        id,
                        email,
                        password
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
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
    });
    describe('Validate oneOf', function () {
        it('Should return error when request body has readOnly', function () {
            const validator = schema['/users/OneOf']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                id,
                email,
                password
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
                id,
                email,
                password
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
                    id,
                    email,
                    password
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
                id,
                email,
                password
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
                    id,
                    email,
                    password
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
                    schemaPath: '#/body/allOf/1/required',
                    params: { missingProperty: 'additionalOneOfField' },
                    message: 'should have required property \'additionalOneOfField\''
                }
            ]);
            expect(isBodysMatch).to.be.false;
        });
    });
});
