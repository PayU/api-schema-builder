'use strict';

let chai = require('chai'),
    expect = chai.expect,
    schemaValidatorGenerator = require('../../../src/index'),
    path = require('path');

describe('oas2 tests - response', function () {
    describe('check body and headers', () => {
        let schema;
        before(function () {
            const swaggerPath = path.join(__dirname, './yaml/pets-response.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, {}).then((receivedSchema) => {
                schema = receivedSchema;
            });
        });
        it('valid empty response - should not have validator', function () {
            let schemaEndpoint = schema['/pet-with-empty-body']['delete'].responses['204'];
            expect(schemaEndpoint).to.be.undefined;
        });
        it('valid body and bad headers validation', function () {
            let schemaEndpoint = schema['/pet-with-body-header']['get'].responses['200'];
            let validatorMatch = schemaEndpoint.validate({ body: {
                id: 321,
                name: 'Roxy'
            },
            headers: {
                'x-next': {}
            } });
            expect(schemaEndpoint.errors).to.be.eql([
                {
                    'dataPath': ".headers['x-next']",
                    'keyword': 'type',
                    'message': 'should be string',
                    'params': {
                        'type': 'string'
                    },
                    'schemaPath': '#/headers/properties/x-next/type'
                }
            ]);
            expect(validatorMatch).to.be.false;
        });
        it('valid headers and bad body validation', function () {
            let schemaEndpoint = schema['/pet-with-body-header']['get'].responses['200'];
            let validatorMatch = schemaEndpoint.validate({ body: {
                id: 321,
                name: []
            },
            headers: {
                'x-next': 123
            } });
            expect(schemaEndpoint.errors).to.be.eql([
                {
                    'dataPath': '.body.name',
                    'keyword': 'type',
                    'message': 'should be string',
                    'params': {
                        'type': 'string'
                    },
                    'schemaPath': '#/body/properties/name/type'
                }
            ]);
            expect(validatorMatch).to.be.false;
        });
        it('bad headers and body validation', function () {
            let schemaEndpoint = schema['/pet-with-body-header']['get'].responses['200'];
            let validatorMatch = schemaEndpoint.validate({ body: {
                id: 321,
                name: []
            },
            headers: {
                'x-next': {}
            } });
            expect(schemaEndpoint.errors).to.be.eql([
                {
                    'dataPath': '.body.name',
                    'keyword': 'type',
                    'message': 'should be string',
                    'params': {
                        'type': 'string'
                    },
                    'schemaPath': '#/body/properties/name/type'
                },
                {
                    'dataPath': ".headers['x-next']",
                    'keyword': 'type',
                    'message': 'should be string',
                    'params': {
                        'type': 'string'
                    },
                    'schemaPath': '#/headers/properties/x-next/type'
                }
            ]);
            expect(validatorMatch).to.be.false;
        });
        it('valid headers and body validation', function () {
            let schemaEndpoint = schema['/pet-with-body-header']['get'].responses['200'];
            let validatorMatch = schemaEndpoint.validate({ body: {
                id: 321,
                name: 'Roxy'
            },
            headers: {
                'x-next': 123
            } });
            expect(schemaEndpoint.errors).to.be.equal(null);
            expect(validatorMatch).to.be.true;
        });
    });

    describe('check body', function () {
        describe('simple', function () {
            let schema;
            before(() => {
                const swaggerPath = path.join(__dirname, './yaml/pets-response.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath)
                    .then((receivedSchema) => {
                        schema = receivedSchema;
                    });
            });

            it('valid response - should pass validation', function () {
                let schemaEndpoint = schema['/pets/:petId']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    id: 1,
                    name: 'Roxy'
                } });
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(validatorMatch).to.be.true;
            });
            it('bad body - wrong type integer', function () {
                let schemaEndpoint = schema['/pets/:petId']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    id: '321',
                    name: 'Roxy'
                } });
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.id',
                        'keyword': 'type',
                        'message': 'should be integer',
                        'params': {
                            'type': 'integer'
                        },
                        'schemaPath': '#/body/properties/id/type'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong type object', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    field2: 321
                } });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.field2',
                        'keyword': 'type',
                        'message': 'should be object',
                        'params': {
                            'type': 'object'
                        },
                        'schemaPath': '#/body/properties/field2/type'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - missing required params', function () {
                let schemaEndpoint = schema['/pets/:petId']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    name: 'Roxy'
                } });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body',
                        'keyword': 'required',
                        'message': "should have required property 'id'",
                        'params': {
                            'missingProperty': 'id'
                        },
                        'schemaPath': '#/body/required'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - missing required object attribute', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: {} });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body',
                        'keyword': 'required',
                        'message': "should have required property 'field2'",
                        'params': {
                            'missingProperty': 'field2'
                        },
                        'schemaPath': '#/body/required'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong enum value', function () {
                let schemaEndpoint = schema['/pet-with-enum']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    field1: 'enum3'
                } });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.field1',
                        'keyword': 'enum',
                        'message': 'should be equal to one of the allowed values',
                        'params': {
                            'allowedValues': [
                                'enum1',
                                'enum2'
                            ]
                        },
                        'schemaPath': '#/body/properties/field1/enum'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong type in array item body (second item)', function () {
                let schemaEndpoint = schema['/pet-with-array']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: [{
                    field1: 'good_field'
                },
                {
                    field1: 111
                }] });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body[1].field1',
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/body/items/properties/field1/type'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong type body (should be an array)', function () {
                let schemaEndpoint = schema['/pet-with-array']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    field1: 'good_field'
                } });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body',
                        'keyword': 'type',
                        'message': 'should be array',
                        'params': {
                            'type': 'array'
                        },
                        'schemaPath': '#/body/type'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('valid nested response - should pass validation', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    field2: {
                        field3: 321
                    }
                } });
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(validatorMatch).to.be.true;
            });
            it('bad body - missing required nested attribute', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    field2: {}
                } });

                // todo - the error doesnt looks good
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.field2',
                        'keyword': 'required',
                        'message': "should have required property 'field3'",
                        'params': {
                            'missingProperty': 'field3'
                        },
                        'schemaPath': '#/body/properties/field2/required'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong type nested attribute', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    field2: {
                        field3: ''
                    }
                } });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.field2.field3',
                        'keyword': 'type',
                        'message': 'should be integer',
                        'params': {
                            'type': 'integer'
                        },
                        'schemaPath': '#/body/properties/field2/properties/field3/type'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('valid default body', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['default'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    code: 321,
                    message: 'msg'
                },
                headers: {} });

                expect(schemaEndpoint.errors).to.be.eql(null);
                expect(validatorMatch).to.be.true;
            });
            it('missing field in default body', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['default'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    code: 321
                },
                headers: {} });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body',
                        'keyword': 'required',
                        'message': "should have required property 'message'",
                        'params': {
                            'missingProperty': 'message'
                        },
                        'schemaPath': '#/body/required'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('wrong field type in default body', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['default'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    code: 321,
                    message: 321
                },
                headers: {} });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.message',
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/body/properties/message/type'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - quantitive test', function () {
                let schemaEndpoint = schema['/many-attributes']['post'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: { 'fieldNum1': 'name1',
                    'fieldNum2': 'name2',
                    'fieldNum3': 'name3',
                    'fieldStr1': 1,
                    'fieldStr2': 2,
                    'fieldStr3': 3 },
                headers: {} });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'keyword': 'type',
                        'dataPath': '.body.fieldNum1',
                        'schemaPath': '#/body/properties/fieldNum1/type',
                        'params': {
                            'type': 'integer'
                        },
                        'message': 'should be integer'
                    },
                    {
                        'keyword': 'type',
                        'dataPath': '.body.fieldNum2',
                        'schemaPath': '#/body/properties/fieldNum2/type',
                        'params': {
                            'type': 'integer'
                        },
                        'message': 'should be integer'
                    },
                    {
                        'keyword': 'type',
                        'dataPath': '.body.fieldNum3',
                        'schemaPath': '#/body/properties/fieldNum3/type',
                        'params': {
                            'type': 'integer'
                        },
                        'message': 'should be integer'
                    },
                    {
                        'keyword': 'type',
                        'dataPath': '.body.fieldStr1',
                        'schemaPath': '#/body/properties/fieldStr1/type',
                        'params': {
                            'type': 'string'
                        },
                        'message': 'should be string'
                    },
                    {
                        'keyword': 'type',
                        'dataPath': '.body.fieldStr2',
                        'schemaPath': '#/body/properties/fieldStr2/type',
                        'params': {
                            'type': 'string'
                        },
                        'message': 'should be string'
                    },
                    {
                        'keyword': 'type',
                        'dataPath': '.body.fieldStr3',
                        'schemaPath': '#/body/properties/fieldStr3/type',
                        'params': {
                            'type': 'string'
                        },
                        'message': 'should be string'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('valid body - quantitive test', function () {
                let schemaEndpoint = schema['/many-attributes']['post'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: { 'fieldNum1': 1,
                    'fieldNum2': 2,
                    'fieldNum3': 3,
                    'fieldStr1': 'name1',
                    'fieldStr2': 'name2',
                    'fieldStr3': 'name3' },
                headers: {} });

                expect(schemaEndpoint.errors).to.be.eql(null);
                expect(validatorMatch).to.be.true;
            });
        });

        describe('base path', function () {
            let schema;
            before(() => {
                const swaggerPath = path.join(__dirname, './yaml/pets-response-with-base-path.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath)
                    .then((receivedSchema) => {
                        schema = receivedSchema;
                    });
            });
            it('valid body with base path', function () {
                let schemaEndpoint = schema['/v1/pets']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ headers: {},
                    body: [{
                        id: 321, name: 'kitty'
                    }] });

                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(validatorMatch).to.be.true;
            });
            it('invalid body with base path', function () {
                let schemaEndpoint = schema['/v1/pets']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ headers: {},
                    body: [{
                        id: 321, name: []
                    }] });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body[0].name',
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/body/items/properties/name/type'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
        });
        describe('Inheritance', function () {
            let schema;
            before(() => {
                const swaggerPath = path.join(__dirname, './yaml/pets-response-inheritance.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath)
                    .then((receivedSchema) => {
                        schema = receivedSchema;
                    });
            });

            it('should pass', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({
                    headers: {},
                    body: {
                        petType: 'Dog',
                        name: 'name',
                        packSize: 3
                    } });

                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(validatorMatch).to.be.true;
            });
            it('should fail for wrong value in discriminator', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    petType: 'dog',
                    name: 'name',
                    tag: 'tag',
                    test: {
                        field1: '1234'
                    }
                },
                headers: {} });

                expect(schemaEndpoint.errors.length).to.equal(1);
                expect(schemaEndpoint.errors[0].message).to.equal('should be equal to one of the allowed values');
                expect(schemaEndpoint.errors[0].dataPath).to.equal('.body.petType');
                expect(schemaEndpoint.errors[0].keyword).to.equal('enum');
                expect(schemaEndpoint.errors[0].params.allowedValues).to.eql([
                    'Cat', 'Dog'
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('should fail for missing discriminator key', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    name: 'name',
                    tag: 'tag',
                    test: {
                        field1: '1234'
                    }
                },
                headers: {

                } });

                expect(schemaEndpoint.errors.length).to.equal(1);
                expect(schemaEndpoint.errors[0].message).to.equal('should be equal to one of the allowed values');
                expect(schemaEndpoint.errors[0].dataPath).to.equal('.body.petType');
                expect(schemaEndpoint.errors[0].keyword).to.equal('enum');
                expect(schemaEndpoint.errors[0].params.allowedValues).to.eql([
                    'Cat', 'Dog'
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('should fail for missing attribute in inherited object (Dog)', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    petType: 'Dog',
                    name: 'name',
                    tag: 'tag',
                    test: {
                        field1: '1234'
                    }
                },
                headers: {} });

                expect(schemaEndpoint.errors.length).to.equal(1);
                expect(schemaEndpoint.errors[0].message).to.equal('should have required property \'packSize\'');
                expect(schemaEndpoint.errors[0].dataPath).to.equal('.body');
                expect(schemaEndpoint.errors[0].keyword).to.equal('required');
                expect(schemaEndpoint.errors[0].params.missingProperty).to.eql('packSize');
                expect(validatorMatch).to.be.false;
            });
            it('should fail for missing attribute in inherited object (cat)', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    petType: 'Cat',
                    name: 'name',
                    tag: 'tag',
                    test: {
                        field1: '1234'
                    }
                },
                headers: {} });

                expect(schemaEndpoint.errors.length).to.equal(1);
                expect(schemaEndpoint.errors[0].message).to.be.eql('should have required property \'huntingSkill\'');
                expect(schemaEndpoint.errors[0].params.missingProperty).to.eql('huntingSkill');
                expect(validatorMatch).to.be.false;
            });
            it('should fail for missing attribute in inherited object (parent)', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    petType: 'Dog',
                    tag: 'tag',
                    packSize: 1,
                    chip_number: '123454'
                },
                headers: {} });

                expect(schemaEndpoint.errors.length).to.equal(1);
                expect(schemaEndpoint.errors[0].message).to.be.equal('should have required property \'name\'');
                expect(schemaEndpoint.errors[0].params.missingProperty).to.eql('name');
                expect(validatorMatch).to.be.false;
            });
        });
        // todo not support yet in files
        // describe.skip('FormData', function () {});
    });
    describe('check headers', function () {
        describe('without base path', function () {
            let schemaEndpoint, schema;
            before(() => {
                const swaggerPath = path.join(__dirname, './yaml/pets-response.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath, {
                    ajvConfigBody: true
                })
                    .then((receivedSchema) => {
                        schema = receivedSchema;
                    });
            });

            it('bad header - wrong type', function () {
                schemaEndpoint = schema['/pet-with-header']['get'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers: {
                        'x-next': []
                    } });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': ".headers['x-next']",
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/headers/properties/x-next/type'
                    }
                ]);
                expect(isValid).to.be.false;
            });
            it('bad header - invalid pattern', function () {
                schemaEndpoint = schema['/pet-with-header']['get'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers: {
                        'pattern-header': '1dsa'
                    } });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': ".headers['pattern-header']",
                        'keyword': 'pattern',
                        'message': 'should match pattern "^\\d{1,3}\\.\\d{1,3}$"',
                        'params': {
                            'pattern': '^\\d{1,3}\\.\\d{1,3}$'
                        },
                        'schemaPath': '#/headers/properties/pattern-header/pattern'
                    }
                ]);
                expect(isValid).to.be.false;
            });
            it('bad header - empty header', function () {
                schemaEndpoint = schema['/pet-with-header']['get'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers: {
                        'minlength-header': ''
                    } });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': ".headers['minlength-header']",
                        'keyword': 'minLength',
                        'message': 'should NOT be shorter than 1 characters',
                        'params': {
                            'limit': 1
                        },
                        'schemaPath': '#/headers/properties/minlength-header/minLength'
                    }
                ]);
                expect(isValid).to.be.false;
            });
            it('valid header', function () {
                schemaEndpoint = schema['/pet-with-header']['get'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers: {
                        'minlength-header': 'aa',
                        'pattern-header': '1.0'
                    } });

                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(isValid).to.be.true;
            });
            it('valid header - default response', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['default'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    code: 321,
                    message: 'msg'
                },
                headers: {
                    'x-next': '321'
                } });

                expect(schemaEndpoint.errors).to.be.eql(null);
                expect(validatorMatch).to.be.true;
            });
            it('wrong field type - response body', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['default'];
                let validatorMatch = schemaEndpoint.validate({ body: {
                    code: 321,
                    message: 'msg'
                },
                headers: {
                    'x-next': {}
                } });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': ".headers['x-next']",
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/headers/properties/x-next/type'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
        });
        describe('with base path', function () {
            let schema;
            before(() => {
                const swaggerPath = path.join(__dirname, './yaml/pets-response-with-base-path.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath)
                    .then((receivedSchema) => {
                        schema = receivedSchema;
                    });
            });
            it('valid headers with base path', function () {
                let schemaEndpoint = schema['/v1/pets']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: [{
                    id: 321, name: 'kitty'
                }],
                headers: {
                    'x-next': 123
                } });

                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(validatorMatch).to.be.true;
            });

            it('invalid headers with base path', function () {
                let schemaEndpoint = schema['/v1/pets']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({ body: [{
                    id: 321, name: 'kitty'
                }],
                headers: {
                    'x-next': []
                } });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': ".headers['x-next']",
                        'keyword': 'type',
                        'message': 'should be string',
                        'params': {
                            'type': 'string'
                        },
                        'schemaPath': '#/headers/properties/x-next/type'
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
        });
    });
    describe('check options', () => {
        describe('contentTypeValidation option', () => {
            describe('contentTypeValidation = true', () => {
                let schemaEndpoint, schema;
                before(() => {
                    const swaggerPath = path.join(__dirname, './yaml/pets-response.yaml');
                    return schemaValidatorGenerator.buildSchema(swaggerPath, {
                        contentTypeValidation: true
                    })
                        .then((receivedSchema) => {
                            schema = receivedSchema;
                        });
                });
                it('more detailed content-type - should pass validation', function () {
                    schemaEndpoint = schema['/pet-with-header']['get'].responses['200'];
                    // todo - should I validate content type only if content-length bigger then 1?
                    let isValid = schemaEndpoint.validate({
                        headers: {
                            'content-type': 'application/json; charset=utf-8',
                            'content-length': '1'
                        }
                    });

                    expect(schemaEndpoint.errors).to.be.equal(null);
                    expect(isValid).to.be.true;
                });
                it('valid content-type when multiple content-types defined - should pass validation', function () {
                    schemaEndpoint = schema['/text']['put'].responses['200'];

                    let isValid = schemaEndpoint.validate({
                        headers: {
                            'content-type': 'text/plain',
                            'content-length': '1'

                        }
                    });

                    expect(schemaEndpoint.errors).to.be.equal(null);
                    expect(isValid).to.be.true;
                });
                it('bad response - wrong content-type (should be application/json)', function () {
                    schemaEndpoint = schema['/text']['put'].responses['200'];

                    let isValid = schemaEndpoint.validate({
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            'content-length': '1'
                        }
                    });

                    expect(schemaEndpoint.errors[0].errors.message).to.be.equal('content-type must be one of text/html,text/plain');
                    expect(schemaEndpoint.errors[0].errors.params['content-type']).to.be.equal('application/x-www-form-urlencoded');

                    expect(isValid).to.be.false;
                });
            });
            describe('contentTypeValidation = false', () => {
                let schemaEndpoint, schema;
                before(() => {
                    const swaggerPath = path.join(__dirname, './yaml/pets-response.yaml');
                    return schemaValidatorGenerator.buildSchema(swaggerPath, {
                        contentTypeValidation: false
                    })
                        .then((receivedSchema) => {
                            schema = receivedSchema;
                        });
                });
                it('valid response - wrong content-type when contentTypeValidation=false', function () {
                    schemaEndpoint = schema['/text']['put'].responses['200'];

                    let isValid = schemaEndpoint.validate({
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            'content-length': '1'
                        }
                    });

                    expect(schemaEndpoint.errors).to.be.equal(null);
                    expect(isValid).to.be.true;
                });
            });
        });
        describe('ajvConfigBody - type coercion option ', function () {
            describe('coerceTypes=true', function(){
                let schema, options = {
                    ajvConfigBody: {
                        coerceTypes: true
                    }
                };
                before(function () {
                    const swaggerPath = path.join(__dirname, './yaml/pets-response.yaml');
                    return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                        schema = receivedSchema;
                    });
                });
                it('request with wrong parameter type - should pass validation due to coercion', function () {
                    let schemaEndpoint = schema['/pets']['put'].responses['200'];

                    let isValid = schemaEndpoint.validate({
                        body: [{
                            id: 1,
                            name: 1,
                            tag: 'tag',
                            test: {
                                field1: 'enum1'
                            }
                        }]
                    });

                    expect(schemaEndpoint.errors).to.be.equal(null);
                    expect(isValid).to.be.true;
                });
            });
            describe('coerceTypes=false', function() {
                let schema, options = {
                    ajvConfigBody: {
                        coerceTypes: false
                    }
                };

                before(function () {
                    const swaggerPath = path.join(__dirname, './yaml/pets-response.yaml');
                    return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                        schema = receivedSchema;
                    });
                });
                it('request with wrong parameter type - should pass validation due to coercion', function () {
                    let schemaEndpoint = schema['/pets']['put'].responses['200'];

                    let isValid = schemaEndpoint.validate({
                        body: [{
                            id: 1,
                            name: 1,
                            tag: 'tag',
                            test: {
                                field1: 'enum1'
                            }
                        }]
                    });

                    expect(schemaEndpoint.errors).to.be.eql([
                        {
                            'dataPath': '.body[0].name',
                            'keyword': 'type',
                            'message': 'should be string',
                            'params': {
                                'type': 'string'
                            },
                            'schemaPath': '#/body/items/properties/name/type'
                        }
                    ]);
                    expect(isValid).to.be.false;
                });
            });
        });
        describe('Keywords', function () {
            const definition = {
                type: 'object',
                macro: function (schema) {
                    if (schema.length === 0) return true;
                    if (schema.length === 1) return { not: { required: schema } };
                    var schemas = schema.map(function (prop) {
                        return { required: [prop] };
                    });
                    return { not: { anyOf: schemas } };
                },
                metaSchema: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            };

            var range = require('ajv-keywords/keywords/range');
            let schema, options = {
                keywords: [range, { name: 'prohibited', definition }],
                expectFormFieldsInBody: true
            };

            before(function () {
                const swaggerPath = path.join(__dirname, './yaml/custom-keywords-response.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                    schema = receivedSchema;
                });
            });

            it('should pass the validation by the range keyword', function () {
                let schemaEndpoint = schema['/keywords']['post'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers: {},
                    body: {
                        age: 25
                    }
                });

                expect(schemaEndpoint.errors).to.be.eql(null);
                expect(isValid).to.be.true;
            });
            it('should be failed by the range keyword', function () {
                // todo - wired errors
                let schemaEndpoint = schema['/keywords']['post'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers: {},
                    body: {
                        age: 50
                    }
                });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body.age',
                        'keyword': 'maximum',
                        'message': 'should be <= 30',
                        'params': {
                            'comparison': '<=',
                            'exclusive': false,
                            'limit': 30
                        },
                        'schemaPath': '#/body/properties/age/maximum'
                    },
                    {
                        'dataPath': '.body.age',
                        'keyword': 'range',
                        'message': 'should pass "range" keyword validation',
                        'params': {
                            'keyword': 'range'
                        },
                        'schemaPath': '#/body/properties/age/range'
                    }
                ]);
                expect(isValid).to.be.false;
            });
            it('should be failed by the prohibited keyword', function () {
                let schemaEndpoint = schema['/keywords']['post'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers: {},
                    body: { ages: 20, age: 20 }
                });

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        'dataPath': '.body',
                        'keyword': 'not',
                        'message': 'should NOT be valid',
                        'params': {},
                        'schemaPath': '#/body/not'
                    },
                    {
                        'dataPath': '.body',
                        'keyword': 'prohibited',
                        'message': 'should pass "prohibited" keyword validation',
                        'params': {
                            'keyword': 'prohibited'
                        },
                        'schemaPath': '#/body/prohibited'
                    }
                ]);
                expect(isValid).to.be.false;
            });
        });
        describe('Formats', function(){
            let schema, options = {
                formats: [
                    { name: 'abcName', pattern: /abc/ }
                ],
                contentTypeValidation: true
            };

            before(function () {
                const swaggerPath = path.join(__dirname, './yaml/pet-store-swagger-formats.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                    schema = receivedSchema;
                });
            });

            it('bad body - wrong format body (should be an abcName format)', function () {
                let schemaEndpoint = schema['/pets']['get'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers: {},
                    body: { id: '111' }
                });

                expect(schemaEndpoint.errors).to.eql([
                    {
                        'dataPath': '.body.id',
                        'keyword': 'format',
                        'message': 'should match format "abcName"',
                        'params': {
                            'format': 'abcName'
                        },
                        'schemaPath': '#/body/properties/id/format'
                    }
                ]);

                expect(isValid).to.be.false;
            });

            it('valid body - good format', function () {
                let schemaEndpoint = schema['/pets']['get'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers: {},
                    body: { id: 'abc' }
                });

                expect(schemaEndpoint.errors).to.eql(null);

                expect(isValid).to.be.true;
            });
        });
    });
});
