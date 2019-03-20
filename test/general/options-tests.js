var chai = require('chai'),
    expect = chai.expect,
    path = require('path'),
    schemaValidatorGenerator = require('../../src/index');

describe('oas2 - general tests', () => {
    describe('BuildRequests and BuildResponses option', function () {
        const swaggerPath = path.join(__dirname, './pet-store-swagger.yaml');

        it('buildRequests=true and buildResponse=true', function () {
            return schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: true, buildResponses: true }).then(receivedSchema => {
                expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
            });
        });
        it('buildRequests=false and buildResponse=true', function () {
            return schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: false, buildResponses: true }).then(receivedSchema => {
                expect(receivedSchema['/pets']['post'].body).to.eql(undefined);
                expect(receivedSchema['/pets']['post'].parameters).to.eql(undefined);
                expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
            });
        });
        it('buildRequests=true and buildResponse=false', function () {
            return schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: true, buildResponses: false }).then(receivedSchema => {
                expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
                expect(receivedSchema['/pets']['post'].responses).to.eql(undefined);
            });
        });
        it('buildRequests=false and buildResponse=false', function () {
            return schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: false, buildResponses: false }).then(receivedSchema => {
                expect(receivedSchema['/pets']['post'].body).to.eql(undefined);
                expect(receivedSchema['/pets']['post'].parameters).to.eql(undefined);
                expect(receivedSchema['/pets']['post'].responses).to.eql(undefined);
            });
        });
        it('buildRequests and buildResponse defaults (both true)', function () {
            return schemaValidatorGenerator.buildSchema(swaggerPath, {}).then(receivedSchema => {
                expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
            });
        });
    });
});
