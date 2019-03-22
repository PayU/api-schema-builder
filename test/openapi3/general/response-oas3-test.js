'use strict';

let chai = require('chai').use(require('chai-as-promised')),
    expect = chai.expect,
    schemaValidatorGenerator = require('../../../src/index'),
    path = require('path');

describe('oas3 check - general', function () {
    describe('check body', function () {
        describe('body with discriminator', function () {
            describe('discriminator-mapping pet', function () {
                it('missing discriminator field on the root', function () {
                    const swaggerPath = path.join(__dirname, 'pets-discrimnator-allOf.yaml');
                    return expect(schemaValidatorGenerator.buildSchema(swaggerPath, {})).to.be.rejectedWith('oneOf must be part of discriminator');
                });
            });
        });
    });
});
