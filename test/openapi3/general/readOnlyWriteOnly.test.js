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
    describe('check body', function () {
        describe('readOnly', function () {
            it('Should return error when request body has readOnly and required prop', function () {
                let validator = schema['/users']['post'].body['application/json'];

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
                let validator = schema['/users2']['post'].body['application/json'];

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
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
        });
        describe('writeOnly', function () {
            it('Should return error when request body has writeOnly and required prop', function () {
                let validator = schema['/users']['post'].responses[200];

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
            it('Should return error when request body has writeOnly and not-required prop', function () {
                let validator = schema['/users2']['post'].responses[200];

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
                        params: { missingProperty: 'email' },
                        message: 'should have required property \'email\''
                    }
                ]);
                expect(isBodysMatch).to.be.false;
            });
        });
    });
});
