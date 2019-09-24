'use strict';

const chai = require('chai').use(require('chai-as-promised'));
const path = require('path');
const fs = require('fs');
const jsyaml = require('js-yaml');
const { expect } = chai;

const schemaValidatorGenerator = require('../../../../src');

describe('Loading definitions file with file refs', () => {
    describe('calling buildSchemaSync with path to definitions file', () => {
        const swaggerPath = path.join(__dirname, 'file-refs.yaml');
        const schema = schemaValidatorGenerator.buildSchemaSync(swaggerPath, {});
        const validator = schema['/users'].post.body['application/json'];

        it('should validate according to yaml file schema', () => {
            validator.validate({
                id: 'dsadasda',
                permissions: []
            });
            expect(validator.errors).to.eql([
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/allOf/0/required',
                    params: { missingProperty: 'email' },
                    message: 'should have required property \'email\''
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/allOf/0/required',
                    params: { missingProperty: 'password' },
                    message: 'should have required property \'password\''
                },
                {
                    keyword: 'required',
                    dataPath: '',
                    schemaPath: '#/allOf/0/required',
                    params: { missingProperty: 'name' },
                    message: 'should have required property \'name\''
                },
                {
                    dataPath: '',
                    keyword: 'type',
                    message: 'should be array',
                    params: {
                        type: 'array'
                    },
                    schemaPath: '#/allOf/1/type'
                }
            ]);
        });
        it('should validate according to json file schema', () => {
            validator.validate({
                email: 'sarabia@gmail.com',
                password: 'qwerty',
                name: 'Sarabia',
                permissions: 'permissions'
            });
            expect(validator.errors).to.eql([
                {
                    dataPath: '',
                    keyword: 'type',
                    message: 'should be array',
                    params: {
                        type: 'array'
                    },
                    schemaPath: '#/allOf/1/type'
                }
            ]);
        });
    });
    describe('calling buildSchemaSync with json schema and baseDir', () => {
        const swaggerPath = path.join(__dirname, 'file-refs.yaml');
        const file = fs.readFileSync(swaggerPath);
        const jsonSchema = jsyaml.load(file);
        const schema = schemaValidatorGenerator.buildSchemaSync(jsonSchema, {
            basePath: __dirname
        });
        const validator = schema['/users'].post.body['application/json'];

        it('should validate according to external file schema', () => {
            validator.validate({
                email: 'sarabia@gmail.com',
                password: 'qwerty',
                name: 'Sarabia',
                permissions: 'permissions'
            });
            expect(validator.errors).to.eql([
                {
                    dataPath: '',
                    keyword: 'type',
                    message: 'should be array',
                    params: {
                        type: 'array'
                    },
                    schemaPath: '#/allOf/1/type'
                }
            ]);
        });
    });
});
