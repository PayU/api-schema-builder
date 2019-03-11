'use strict';

let chai = require('chai'),
    expect = chai.expect,
    chaiSinon = require('chai-sinon'),
    schemaValidatorGenerator = require('../src/index'),
    path = require('path');

chai.use(chaiSinon);
describe('general tests', function () {
    describe('fail load swagger', function () {
        it('valid headers', function () {
            const swaggerPath = path.join(__dirname, 'wrong-path.yaml');
            return schemaValidatorGenerator.getSchema(swaggerPath, {})
                .then(function(m) { throw new Error('was not supposed to succeed') })
                .catch(function(m) { expect(m.message).to.contains('Error opening file') })
            ;
        });
    });
});
