var chai = require('chai'),
    expect = chai.expect,
    path = require('path'),
    schemaValidatorGenerator = require('../../../src/index');

describe('oai2 - general tests', () => {
    describe('sync', () => {
        describe('BuildRequests and BuildResponses option', () => {
            const swaggerPath = path.join(__dirname, './pet-store-swagger.yaml');

            it('buildRequests=true and buildResponse=true', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {
                    buildRequests: true,
                    buildResponses: true
                });
                expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
            });
            it('buildRequests=false and buildResponse=true', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {
                    buildRequests: false,
                    buildResponses: true
                });
                expect(receivedSchema['/pets']['post'].body).to.eql(undefined);
                expect(receivedSchema['/pets']['post'].parameters).to.eql(undefined);
                expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
            });
            it('buildRequests=true and buildResponse=false', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {
                    buildRequests: true,
                    buildResponses: false
                });
                expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
                expect(receivedSchema['/pets']['post'].responses).to.eql(undefined);
            });
            it('buildRequests=false and buildResponse=false', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {
                    buildRequests: false,
                    buildResponses: false
                });
                expect(receivedSchema['/pets']['post'].body).to.eql(undefined);
                expect(receivedSchema['/pets']['post'].parameters).to.eql(undefined);
                expect(receivedSchema['/pets']['post'].responses).to.eql(undefined);
            });
            it('buildRequests and buildResponse defaults (both true)', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
                expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
            });
        });
        describe('No options are sent', () => {
            it('Should load schema', () => {
                const swaggerPath = path.join(__dirname, './pet-store-swagger.yaml');
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath);
                expect(typeof receivedSchema['/pets']['post'].body).to.exist;
                expect(typeof receivedSchema['/pets']['post'].parameters).to.exist;
            });
        });
        describe('base path', () => {
            it('is prepended to each path', () => {
                const swaggerPath = path.join(__dirname, 'pet-store-basepath.yaml');
                const schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
                expect(Object.keys(schema)).to.eql(['/staging/pets']);
                expect(typeof schema['/staging/pets'].post.body.validate).to.eql('function');
            });
        });
    });

    describe('async', () => {
        describe('BuildRequests and BuildResponses option', () => {
            const swaggerPath = path.join(__dirname, './pet-store-swagger.yaml');

            it('buildRequests=true and buildResponse=true', () => {
                return schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: true,
                    buildResponses: true
                }).then((receivedSchema) => {
                    expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
                    expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
                    expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
                });
            });
            it('buildRequests=false and buildResponse=true', () => {
                return schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: false,
                    buildResponses: true
                }).then((receivedSchema) => {
                    expect(receivedSchema['/pets']['post'].body).to.eql(undefined);
                    expect(receivedSchema['/pets']['post'].parameters).to.eql(undefined);
                    expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
                });
            });
            it('buildRequests=true and buildResponse=false', () => {
                return schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: true,
                    buildResponses: false
                }).then((receivedSchema) => {
                    expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
                    expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
                    expect(receivedSchema['/pets']['post'].responses).to.eql(undefined);
                });
            });
            it('buildRequests=false and buildResponse=false', () => {
                return schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: false,
                    buildResponses: false
                }).then((receivedSchema) => {
                    expect(receivedSchema['/pets']['post'].body).to.eql(undefined);
                    expect(receivedSchema['/pets']['post'].parameters).to.eql(undefined);
                    expect(receivedSchema['/pets']['post'].responses).to.eql(undefined);
                });
            });
            it('buildRequests and buildResponse defaults (both true)', () => {
                return schemaValidatorGenerator.buildSchema(swaggerPath, {})
                    .then((receivedSchema) => {
                        expect(typeof receivedSchema['/pets']['post'].body.validate).to.eql('function');
                        expect(typeof receivedSchema['/pets']['post'].parameters.validate).to.eql('function');
                        expect(typeof receivedSchema['/pets']['post'].responses['201'].validate).to.eql('function');
                    });
            });
        });
        describe('No options are sent', () => {
            it('Should load schema', () => {
                const swaggerPath = path.join(__dirname, './pet-store-swagger.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath, {})
                    .then((receivedSchema) => {
                        expect(typeof receivedSchema['/pets']['post'].body).to.exist;
                        expect(typeof receivedSchema['/pets']['post'].parameters).to.exist;
                    });
            });
        });
    });
});
