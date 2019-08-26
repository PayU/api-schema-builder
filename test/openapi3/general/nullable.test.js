'use strict';

const chai = require('chai');
const expect = chai.expect;
const schemaValidatorGenerator = require('../../../src/index');
const path = require('path');

const password = 'qwerty';
const email = 'email@domain.com';
const id = '1';

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
                id,
                email,
                password,
                name: null
            });

            expect(validator.errors).to.be.eql(null);
            expect(isBodysMatch).to.be.true;
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
                    email,
                    password,
                    name: null
                }
            });

            expect(validator.errors).to.be.eql(null);
            expect(isBodysMatch).to.be.true;
        });
    });
    describe('Validate nested objects', function () {
        it('Should return error when request body has nullable', function () {
            const validator = schema['/users/nested']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                user: {
                    id,
                    email,
                    password,
                    name: null
                },
                lastLogin: new Date().getTime()
            });

            expect(validator.errors).to.be.eql(null);
            expect(isBodysMatch).to.be.true;
        });
    });
    describe('Validate nested object in array', function () {
        it('Should return error when request body has nullable', function () {
            const validator = schema['/users/usersArray']['post'].body['application/json'];

            const isBodysMatch = validator.validate([
                {
                    email,
                    password,
                    name: null
                }
            ]);

            expect(validator.errors).to.be.eql(null);
            expect(isBodysMatch).to.be.true;
        });
    });
    describe('Validate oneOf', function () {
        it('Should return error when request body has nullable', function () {
            const validator = schema['/users/OneOf']['post'].body['application/json'];

            const isBodysMatch = validator.validate({
                id,
                email,
                password,
                name: null
            });

            expect(validator.errors).to.be.eql(null);
            expect(isBodysMatch).to.be.true;
        });
    });
});
