var chai = require('chai'),
    expect = chai.expect,
    path = require('path'),
    schemaValidatorGenerator = require('../../../src/index');

describe('oai2 - general tests', () => {
    describe('BuildRequests and BuildResponses option', function () {
        const swaggerPath = path.join(__dirname, './pet-store-swagger.yaml');

        it('buildRequests=true and buildResponse=true', function () {
            const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: true, buildResponses: true });
            expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
            expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
            expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
        });
        it('buildRequests=false and buildResponse=true', function () {
            const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: false, buildResponses: true });
            expect(receivedSchema['/pets']['post'].body).to.eql(undefined);
            expect(receivedSchema['/pets']['post'].parameters).to.eql(undefined);
            expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
        });
        it('buildRequests=true and buildResponse=false', function () {
            const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: true, buildResponses: false });
            expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
            expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
            expect(receivedSchema['/pets']['post'].responses).to.eql(undefined);
        });
        it('buildRequests=false and buildResponse=false', function () {
            const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: false, buildResponses: false });
            expect(receivedSchema['/pets']['post'].body).to.eql(undefined);
            expect(receivedSchema['/pets']['post'].parameters).to.eql(undefined);
            expect(receivedSchema['/pets']['post'].responses).to.eql(undefined);
        });
        it('buildRequests and buildResponse defaults (both true)', function () {
            const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath, {});
            expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
            expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
            expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
        });
    });
    describe('No options are sent', function(){
        it('Should load schema', () => {
            const swaggerPath = path.join(__dirname, './pet-store-swagger.yaml');
            const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath);
            expect(typeof receivedSchema['/pets']['post'].body).to.exist;
            expect(typeof receivedSchema['/pets']['post'].parameters).to.exist;
        });
    });
});
