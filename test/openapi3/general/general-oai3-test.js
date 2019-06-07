'use strict';

let chai = require('chai').use(require('chai-as-promised')),
    expect = chai.expect,
    schemaValidatorGenerator = require('../../../src/index'),
    path = require('path');

describe('oai3 - general tests', () => {
    describe('sync', () => {
        describe('loading yaml with discriminator with allOf', () => {
            it('fail to load with relevant error', () => {
                const swaggerPath = path.join(__dirname, 'pets-discriminator-allOf.yaml');
                return expect(() => {
                    schemaValidatorGenerator.buildSchema(swaggerPath, {});
                }).to.throw('oneOf must be part of discriminator');
            });
        });

        // support only application/json in request and response (no file)
        describe('loading yaml with content type diff from application/json', () => {
            it('loading yaml without response and request validators', () => {
                const swaggerPath = path.join(__dirname, 'pets-general.yaml');
                const schema = schemaValidatorGenerator.buildSchema(swaggerPath, {});
                expect(schema['/text']['put'].body).to.be.undefined;
                expect(schema['/text']['put'].responses['201']).to.be.undefined;
            });
        });

        describe('BuildRequests and BuildResponses option', () => {
            const swaggerPath = path.join(__dirname, './pets-general.yaml');

            it('buildRequests=true and buildResponse=true', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: true,
                    buildResponses: true
                });
                expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
            });
            it('buildRequests=false and buildResponse=true', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: false,
                    buildResponses: true
                });
                expect(receivedSchema['/json']['put'].body).to.equal(undefined);
                expect(receivedSchema['/json']['put'].parameters).to.equal(undefined);
                expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
            });
            it('buildRequests=true and buildResponse=false', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: true,
                    buildResponses: false
                });
                expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                expect(receivedSchema['/json']['put'].responses).to.eql(undefined);
            });
            it('buildRequests=false and buildResponse=false', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: false,
                    buildResponses: false
                });
                expect(receivedSchema['/json']['put'].body).to.eql(undefined);
                expect(receivedSchema['/json']['put'].parameters).to.eql(undefined);
                expect(receivedSchema['/json']['put'].responses).to.eql(undefined);
            });
            it('buildRequests and buildResponse defaults (both true)', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath, {});
                expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
            });
        });
        describe('No options are sent', () => {
            it('Should load schema', () => {
                const swaggerPath = path.join(__dirname, './pets-general.yaml');
                const receivedSchema = schemaValidatorGenerator.buildSchema(swaggerPath);
                expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
            });
        });
    });

    describe('async', () => {
        describe('loading yaml with discriminator with allOf', () => {
            it('fail to load with relevant error', (done) => {
                const swaggerPath = path.join(__dirname, 'pets-discriminator-allOf.yaml');
                schemaValidatorGenerator.buildSchemaAsync(swaggerPath, {})
                    .catch((err) => {
                        expect(err.message).to.equal('oneOf must be part of discriminator');
                        done();
                    });
            });
        });

        // support only application/json in request and response (no file)
        describe('loading yaml with content type diff from application/json', () => {
            it('loading yaml without response and request validators', () => {
                const swaggerPath = path.join(__dirname, 'pets-general.yaml');
                return schemaValidatorGenerator.buildSchemaAsync(swaggerPath, {}).then((schema) => {
                    expect(schema['/text']['put'].body).to.be.undefined;
                    expect(schema['/text']['put'].responses['201']).to.be.undefined;
                });
            });
        });

        describe('BuildRequests and BuildResponses option', () => {
            const swaggerPath = path.join(__dirname, './pets-general.yaml');

            it('buildRequests=true and buildResponse=true', () => {
                return schemaValidatorGenerator.buildSchemaAsync(swaggerPath, {
                    buildRequests: true,
                    buildResponses: true
                }).then((receivedSchema) => {
                    expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                    expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                    expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
                });
            });
            it('buildRequests=false and buildResponse=true', () => {
                return schemaValidatorGenerator.buildSchemaAsync(swaggerPath, {
                    buildRequests: false,
                    buildResponses: true
                }).then((receivedSchema) => {
                    expect(receivedSchema['/json']['put'].body).to.equal(undefined);
                    expect(receivedSchema['/json']['put'].parameters).to.equal(undefined);
                    expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
                });
            });
            it('buildRequests=true and buildResponse=false', () => {
                return schemaValidatorGenerator.buildSchemaAsync(swaggerPath, {
                    buildRequests: true,
                    buildResponses: false
                }).then((receivedSchema) => {
                    expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                    expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                    expect(receivedSchema['/json']['put'].responses).to.eql(undefined);
                });
            });
            it('buildRequests=false and buildResponse=false', () => {
                return schemaValidatorGenerator.buildSchemaAsync(swaggerPath, {
                    buildRequests: false,
                    buildResponses: false
                }).then((receivedSchema) => {
                    expect(receivedSchema['/json']['put'].body).to.eql(undefined);
                    expect(receivedSchema['/json']['put'].parameters).to.eql(undefined);
                    expect(receivedSchema['/json']['put'].responses).to.eql(undefined);
                });
            });
            it('buildRequests and buildResponse defaults (both true)', () => {
                return schemaValidatorGenerator.buildSchemaAsync(swaggerPath, {}).then((receivedSchema) => {
                    expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                    expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                    expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
                });
            });
            describe('No options are sent', () => {
                it('Should load schema', () => {
                    const swaggerPath = path.join(__dirname, './pets-general.yaml');
                    return schemaValidatorGenerator.buildSchemaAsync(swaggerPath).then((receivedSchema) => {
                        expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                        expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                        expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
                    });
                });
            });
        });
    });
});
