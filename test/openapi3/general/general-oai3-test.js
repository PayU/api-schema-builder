'use strict';

let chai = require('chai').use(require('chai-as-promised')),
    expect = chai.expect,
    schemaValidatorGenerator = require('../../../src/index'),
    path = require('path');

describe('oai3 - general tests', function () {
    describe('loading yaml with discriminator with allOf', function () {
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

    describe('BuildRequests and BuildResponses option', function () {
        const swaggerPath = path.join(__dirname, './pets-general.yaml');

        it('buildRequests=true and buildResponse=true', function () {
            return schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: true, buildResponses: true }).then(receivedSchema => {
                expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
            });
        });
        it('buildRequests=false and buildResponse=true', function () {
            return schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: false, buildResponses: true }).then(receivedSchema => {
                expect(receivedSchema['/json']['put'].body).to.equal(undefined);
                expect(receivedSchema['/json']['put'].parameters).to.equal(undefined);
                expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
            });
        });
        it('buildRequests=true and buildResponse=false', function () {
            return schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: true, buildResponses: false }).then(receivedSchema => {
                expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                expect(receivedSchema['/json']['put'].responses).to.eql(undefined);
            });
        });
        it('buildRequests=false and buildResponse=false', function () {
            return schemaValidatorGenerator.buildSchema(swaggerPath, { buildRequests: false, buildResponses: false }).then(receivedSchema => {
                expect(receivedSchema['/json']['put'].body).to.eql(undefined);
                expect(receivedSchema['/json']['put'].parameters).to.eql(undefined);
                expect(receivedSchema['/json']['put'].responses).to.eql(undefined);
            });
        });
        it('buildRequests and buildResponse defaults (both true)', function () {
            return schemaValidatorGenerator.buildSchema(swaggerPath, {}).then(receivedSchema => {
                expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
            });
        });
    });
    describe('No options are sent', function(){
        it('Should load schema', () => {
            const swaggerPath = path.join(__dirname, './pets-general.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath).then(receivedSchema => {
                expect(typeof receivedSchema['/json']['put'].body.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].parameters.validate).to.eql('function');
                expect(typeof receivedSchema['/json']['put'].responses['200'].validate).to.eql('function');
            });
        });
    });
});
