'use strict';

let chai = require('chai').use(require('chai-as-promised')),
    expect = chai.expect,
    schemaValidatorGenerator = require('../../../src/index'),
    path = require('path');

describe('oas3 check - general', function () {
    describe('loading yaml with discriminator with anyOf', function () {
        it('fail to load with relevant error', function () {
            const swaggerPath = path.join(__dirname, 'pets-discriminator-allOf.yaml');
            return expect(schemaValidatorGenerator.buildSchema(swaggerPath, {})).to.be.rejectedWith('oneOf must be part of discriminator');
        });
    });

    // support only application/json in request and response (no file)
    describe('loading yaml with content type diff from application/json', function () {
        it('loading yaml without response and request validators', function () {
            const swaggerPath = path.join(__dirname, 'pets-general.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, {})
                .then(schema => {
                    expect(schema['/text']['put'].body).to.be.undefined;
                    expect(schema['/text']['put'].responses['201']).to.be.undefined;
                });
        });
    });
});
