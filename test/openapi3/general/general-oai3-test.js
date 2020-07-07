'use strict';

const chai = require('chai').use(require('chai-as-promised'));
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');

const schemaValidatorGenerator = require('../../../src');
const schemaLoaders = require('../../../src/utils/schemaLoaders');

const { expect } = chai;

describe('oai3 - general tests', () => {
    describe('sync', () => {
        describe('getSchemas', () => {
            it('Validates OpenAPI specification to be valid', (done) => {
                try {
                    schemaLoaders.loadSchema('test/utils/specs/openApi3SpecInvalid.yaml');
                } catch (err) {
                    expect(err.message).to.equal('Invalid OpenAPI 3 schema');
                    expect(err.errors).to.deep.equal([
                        {
                            keyword: 'required',
                            dataPath: '',
                            schemaPath: '#/required',
                            params: {
                                missingProperty: 'info'
                            },
                            message: "should have required property 'info'"
                        }
                    ]);
                    done();
                }
            });
        });
        describe('loading yaml with discriminator with allOf', () => {
            it('fail to load with relevant error', () => {
                const swaggerPath = path.join(__dirname, 'pets-discriminator-allOf.yaml');
                return expect(() => {
                    schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
                }).to.throw('oneOf must be part of discriminator');
            });
        });

        // loads all content-types in request and response
        describe('loading yaml with content type diff from application/json', () => {
            it('loading yaml without response and request validators', () => {
                const swaggerPath = path.join(__dirname, 'pets-general.yaml');
                const schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
                expect(Object.keys(schema['/text'].put.body)).to.eql(['plain/text']);
                expect(schema['/text'].put.responses['201']).to.be.undefined;
            });
        });

        describe('supports custom content types', () => {
            const swaggerPath = path.join(__dirname, './pets-custom-content-type.yaml');
            it('supports using custom content type in request and response schemas', () => {
                const schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath);
                expect(schema['/haljson'].put.body).to.be.ok;
                expect(schema['/haljson'].put.responses['200'].validate).to.be.ok;
            });
        });

        describe('BuildRequests and BuildResponses option', () => {
            const swaggerPath = path.join(__dirname, './pets-general.yaml');

            it('buildRequests=true and buildResponse=true', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {
                    buildRequests: true,
                    buildResponses: true
                });
                expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
            });

            it('buildRequests=true and buildResponse=true fills non-content-type-specific validator as well', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {
                    buildRequests: true,
                    buildResponses: true
                });
                expect(typeof receivedSchema['/json'].put.body.validate).to.eql('function');
            });

            it('buildRequests=false and buildResponse=true', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {
                    buildRequests: false,
                    buildResponses: true
                });
                expect(receivedSchema['/json'].put.body).to.equal(undefined);
                expect(receivedSchema['/json'].put.parameters).to.equal(undefined);
                expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
            });
            it('buildRequests=true and buildResponse=false', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {
                    buildRequests: true,
                    buildResponses: false
                });
                expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                expect(receivedSchema['/json'].put.responses).to.eql(undefined);
            });
            it('buildRequests=false and buildResponse=false', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {
                    buildRequests: false,
                    buildResponses: false
                });
                expect(receivedSchema['/json'].put.body).to.eql(undefined);
                expect(receivedSchema['/json'].put.parameters).to.eql(undefined);
                expect(receivedSchema['/json'].put.responses).to.eql(undefined);
            });
            it('buildRequests and buildResponse defaults (both true)', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
                expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
            });
        });
        describe('No options are sent', () => {
            it('Should load schema', () => {
                const swaggerPath = path.join(__dirname, './pets-general.yaml');
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(swaggerPath);
                expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
            });
        });
        describe('servers', () => {
            it('copies schema for each base path', () => {
                const swaggerPath = path.join(__dirname, 'pets-general.yaml');
                const schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
                expect(Object.keys(schema)).to.eql([
                    '/text',
                    '/staging/text',
                    '/empty',
                    '/staging/empty',
                    '/json',
                    '/staging/json'
                ]);
                expect(typeof schema['/json'].put.body['application/json'].validate).to.eql('function');
                expect(typeof schema['/staging/json'].put.body['application/json'].validate).to.eql('function');
            });
            it('correctly works with empty servers', () => {
                const swaggerPath = path.join(__dirname, 'pets-general-empty-servers.yaml');
                const schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
                expect(Object.keys(schema)).to.eql([
                    '/text',
                    '/empty',
                    '/json'
                ]);
                expect(typeof schema['/json'].put.body['application/json'].validate).to.eql('function');
            });
            it('correctly works without servers', () => {
                const swaggerPath = path.join(__dirname, 'pets-general-no-servers.yaml');
                const schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
                expect(Object.keys(schema)).to.eql([
                    '/text',
                    '/empty',
                    '/json'
                ]);
                expect(typeof schema['/json'].put.body['application/json'].validate).to.eql('function');
            });
        });
    });

    describe('async', () => {
        describe('loading yaml with discriminator with allOf', () => {
            it('fail to load with relevant error', (done) => {
                const swaggerPath = path.join(__dirname, 'pets-discriminator-allOf.yaml');
                schemaValidatorGenerator.buildSchema(swaggerPath, {})
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
                return schemaValidatorGenerator.buildSchema(swaggerPath, {}).then((schema) => {
                    expect(schema['/text'].put.body['application/json']).to.be.undefined;
                    expect(schema['/text'].put.responses['201']).to.be.undefined;
                });
            });
        });

        describe('BuildRequests and BuildResponses option', () => {
            const swaggerPath = path.join(__dirname, './pets-general.yaml');

            it('buildRequests=true and buildResponse=true', () => {
                return schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: true,
                    buildResponses: true
                }).then((receivedSchema) => {
                    expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                    expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                    expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
                });
            });
            it('buildRequests=false and buildResponse=true', () => {
                return schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: false,
                    buildResponses: true
                }).then((receivedSchema) => {
                    expect(receivedSchema['/json'].put.body).to.equal(undefined);
                    expect(receivedSchema['/json'].put.parameters).to.equal(undefined);
                    expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
                });
            });
            it('buildRequests=true and buildResponse=false', () => {
                return schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: true,
                    buildResponses: false
                }).then((receivedSchema) => {
                    expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                    expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                    expect(receivedSchema['/json'].put.responses).to.eql(undefined);
                });
            });
            it('buildRequests=false and buildResponse=false', () => {
                return schemaValidatorGenerator.buildSchema(swaggerPath, {
                    buildRequests: false,
                    buildResponses: false
                }).then((receivedSchema) => {
                    expect(receivedSchema['/json'].put.body).to.eql(undefined);
                    expect(receivedSchema['/json'].put.parameters).to.eql(undefined);
                    expect(receivedSchema['/json'].put.responses).to.eql(undefined);
                });
            });
            it('buildRequests and buildResponse defaults (both true)', () => {
                return schemaValidatorGenerator.buildSchema(swaggerPath, {}).then((receivedSchema) => {
                    expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                    expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                    expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
                });
            });
            describe('No options are sent', () => {
                it('Should load schema', () => {
                    const swaggerPath = path.join(__dirname, './pets-general.yaml');
                    return schemaValidatorGenerator.buildSchema(swaggerPath).then((receivedSchema) => {
                        expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                        expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                        expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
                    });
                });
            });
        });
    });

    describe('init with json schema', () => {
        function loadYamlAsJson(filename) {
            const swaggerPath = path.join(__dirname, filename);
            const jsonSchema = yaml.load(fs.readFileSync(swaggerPath), 'utf8');
            return jsonSchema;
        }
        describe('loading yaml with discriminator with allOf', () => {
            it('fail to load with relevant error', () => {
                const jsonSchema = loadYamlAsJson('pets-discriminator-allOf.yaml');

                function buildSchemaSync() {
                    schemaValidatorGenerator.buildSchemaSync(jsonSchema, {});
                }

                expect(buildSchemaSync)
                    .to.throw('oneOf must be part of discriminator');
            });
        });

        // support only application/json in request and response (no file)
        describe('loading yaml with content type diff from application/json', () => {
            it('loading yaml without response and request validators', () => {
                const jsonSchema = loadYamlAsJson('pets-general.yaml');
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(jsonSchema, {});
                expect(receivedSchema['/text'].put.body['application/json']).to.be.undefined;
                expect(receivedSchema['/text'].put.responses['201']).to.be.undefined;
            });
        });

        describe('BuildRequests and BuildResponses option', () => {
            const jsonSchema = loadYamlAsJson('pets-general.yaml');

            it('buildRequests=true and buildResponse=true', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(jsonSchema, {
                    buildRequests: true,
                    buildResponses: true
                });
                expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
            });
            it('buildRequests=false and buildResponse=true', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(jsonSchema, {
                    buildRequests: false,
                    buildResponses: true
                });
                expect(receivedSchema['/json'].put.body).to.equal(undefined);
                expect(receivedSchema['/json'].put.parameters).to.equal(undefined);
                expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
            });
            it('buildRequests=true and buildResponse=false', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(jsonSchema, {
                    buildRequests: true,
                    buildResponses: false
                });
                expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                expect(receivedSchema['/json'].put.responses).to.eql(undefined);
            });
            it('buildRequests=false and buildResponse=false', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(jsonSchema, {
                    buildRequests: false,
                    buildResponses: false
                });
                expect(receivedSchema['/json'].put.body).to.eql(undefined);
                expect(receivedSchema['/json'].put.parameters).to.eql(undefined);
                expect(receivedSchema['/json'].put.responses).to.eql(undefined);
            });
            it('buildRequests and buildResponse defaults (both true)', () => {
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(jsonSchema, {});
                expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
            });
        });
        describe('No options are sent', () => {
            it('Should load schema', () => {
                const jsonSchema = loadYamlAsJson('pets-general.yaml');
                const receivedSchema = schemaValidatorGenerator.buildSchemaSync(jsonSchema, {});
                expect(typeof receivedSchema['/json'].put.body['application/json'].validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json'].put.responses['200'].validate).to.eql('function');
            });
        });
    });
});
