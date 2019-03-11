'use strict';

let chai = require('chai'),
    expect = chai.expect,
    chaiSinon = require('chai-sinon'),
    schemaValidatorGenerator = require('../../src/index'),
    path = require('path');

chai.use(chaiSinon);
describe('options check', function () {
    describe('Type coercion (check ajvConfigBody is pass)', function () {
        let schema, schemaEndpoint;
        before(function () {
            const swaggerPath = path.join(__dirname, 'pets.yaml');
            return schemaValidatorGenerator.getSchema(swaggerPath, {
                ajvConfigBody: {
                    coerceTypes: true
                }
            }).then((receivedSchema) => {
                schema = receivedSchema;
                schemaEndpoint = schema['/pets']['put'];
            });
        });
        it('request with wrong parameter type - should pass validation due to coercion', function () {
            // parameters match
            let isParametersMatch = schemaEndpoint.body.validate([{
                name: 1,
                tag: 'tag',
                test: {
                    field1: 'enum1'
                }
            }]);
            expect(isParametersMatch).to.be.true;
            expect(schemaEndpoint.body.errors).to.be.equal(null);
        });
    });
});
