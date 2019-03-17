'use strict';

let chai = require('chai'),
    expect = chai.expect,
    chaiSinon = require('chai-sinon'),
    schemaValidatorGenerator = require('../../src/index'),
    path = require('path'),
    InputValidationError = require('../inputValidationError');

chai.use(chaiSinon);
describe('oas2 check - response', function () {
    describe('check body and headers', () =>{
        let schema;
        before(function () {
            const swaggerPath = path.join(__dirname, 'pets-response.yaml');
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
            let validatorMatch = schemaEndpoint.validate({   body: {
                    id: 321,
                    name: 'Roxy'
                },
            headers:{
                'x-next':{}
            }});
            expect(schemaEndpoint.errors).to.be.eql([
                {
                    "dataPath": ".headers['x-next']",
                    "keyword": "type",
                    "message": "should be string",
                    "params": {
                        "type": "string"
                    },
                    "schemaPath": "#/headers/properties/x-next/type"
                }
            ]);
            expect(validatorMatch).to.be.false;
        });
        it('valid headers and bad body validation', function () {
            let schemaEndpoint = schema['/pet-with-body-header']['get'].responses['200'];
            let validatorMatch = schemaEndpoint.validate({   body: {
                    id: 321,
                    name: []
                },
                headers:{
                    'x-next': 123
                }});
            expect(schemaEndpoint.errors).to.be.eql([
                {
                    "dataPath": ".body.name",
                    "keyword": "type",
                    "message": "should be string",
                    "params": {
                        "type": "string"
                    },
                    "schemaPath": "#/body/properties/name/type"
                }
            ]);
            expect(validatorMatch).to.be.false;
        });
        it('bad headers and body validation', function () {
            let schemaEndpoint = schema['/pet-with-body-header']['get'].responses['200'];
            let validatorMatch = schemaEndpoint.validate({   body: {
                    id: 321,
                    name: []
                },
                headers:{
                    'x-next':{}
                }});
            expect(schemaEndpoint.errors).to.be.eql([
                {
                    "dataPath": ".body.name",
                    "keyword": "type",
                    "message": "should be string",
                    "params": {
                        "type": "string"
                    },
                    "schemaPath": "#/body/properties/name/type"
                },
                {
                    "dataPath": ".headers['x-next']",
                    "keyword": "type",
                    "message": "should be string",
                    "params": {
                        "type": "string"
                    },
                    "schemaPath": "#/headers/properties/x-next/type"
                }
            ]);
            expect(validatorMatch).to.be.false;
        });
        it('valid headers and body validation', function () {
            let schemaEndpoint = schema['/pet-with-body-header']['get'].responses['200'];
            let validatorMatch = schemaEndpoint.validate({   body: {
                    id: 321,
                    name: 'Roxy'
                },
                headers:{
                    'x-next': 123
                }});
            expect(schemaEndpoint.errors).to.be.equal(null);
            expect(validatorMatch).to.be.true;
        });
    });

    describe('check body', function () {
        describe('simple', function () {
            let schema;
            before(() => {
                const swaggerPath = path.join(__dirname, './pets-response.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath)
                    .then((receivedSchema) => {
                        schema = receivedSchema;
                    })
            });
            it('valid response - should pass validation', function () {
                let schemaEndpoint = schema['/pets/:petId']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        id: 1,
                        name: 'Roxy'
                    }});
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(validatorMatch).to.be.true;
            });
            it('bad body - wrong type integer', function () {
                let schemaEndpoint = schema['/pets/:petId']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        id: '321',
                        name: 'Roxy'
                    }});
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body.id",
                        "keyword": "type",
                        "message": "should be integer",
                        "params": {
                            "type": "integer"
                        },
                        "schemaPath": "#/body/properties/id/type"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong type object', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        field2: 321
                    }});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body.field2",
                        "keyword": "type",
                        "message": "should be object",
                        "params": {
                            "type": "object"
                        },
                        "schemaPath": "#/body/properties/field2/type"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - missing required params', function () {
                let schemaEndpoint = schema['/pets/:petId']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        name: 'Roxy'
                    }});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body",
                        "keyword": "required",
                        "message": "should have required property 'id'",
                        "params": {
                            "missingProperty": "id"
                        },
                        "schemaPath": "#/body/required"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - missing required object attribute', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {}});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body",
                        "keyword": "required",
                        "message": "should have required property 'field2'",
                        "params": {
                            "missingProperty": "field2"
                        },
                        "schemaPath": "#/body/required"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong enum value', function () {
                let schemaEndpoint = schema['/pet-with-enum']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        field1: 'enum3'
                    }});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body.field1",
                        "keyword": "enum",
                        "message": "should be equal to one of the allowed values",
                        "params": {
                            "allowedValues": [
                                "enum1",
                                "enum2"
                            ]
                        },
                        "schemaPath": "#/body/properties/field1/enum"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong format in array item body (second item)', function () {
                let schemaEndpoint = schema['/pet-with-array']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: [{
                        field1: 'good_field'
                    },
                        {
                            field1: 111
                        }]});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body[1].field1",
                        "keyword": "type",
                        "message": "should be string",
                        "params": {
                            "type": "string"
                        },
                        "schemaPath": "#/body/items/properties/field1/type"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong format body (should be an array)', function () {
                let schemaEndpoint = schema['/pet-with-array']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        field1: 'good_field'
                    }});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body",
                        "keyword": "type",
                        "message": "should be array",
                        "params": {
                            "type": "array"
                        },
                        "schemaPath": "#/body/type"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('valid nested response - should pass validation', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        field2: {
                            field3: 321
                        }
                    }});
                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(validatorMatch).to.be.true;
            });
            it('bad body - missing required nested attribute', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        field2: {}
                    }});

                //todo - the error doesnt looks good
                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body.field2",
                        "keyword": "required",
                        "message": "should have required property 'field3'",
                        "params": {
                            "missingProperty": "field3"
                        },
                        "schemaPath": "#/body/properties/field2/required"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong type nested attribute', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        field2: {
                            field3:''
                        }
                    }});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body.field2.field3",
                        "keyword": "type",
                        "message": "should be integer",
                        "params": {
                            "type": "integer"
                        },
                        "schemaPath": "#/body/properties/field2/properties/field3/type"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
            it('bad body - wrong format nested attribute', function () {
                let schemaEndpoint = schema['/pet-with-object']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        field2: {
                            field3:''
                        }
                    }});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body.field2.field3",
                        "keyword": "type",
                        "message": "should be integer",
                        "params": {
                            "type": "integer"
                        },
                        "schemaPath": "#/body/properties/field2/properties/field3/type"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
        });

        describe('base path', function () {
            let schema;
            before(() => {
                const swaggerPath = path.join(__dirname, './pets-response-with-base-path.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath)
                    .then((receivedSchema) => {
                        schema = receivedSchema;
                    })
            });
            it('valid body with base path', function () {
                let schemaEndpoint = schema['/v1/pets']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: [{
                        id: 321, name: 'kitty'
                    }]});

                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(validatorMatch).to.be.true;
            });


            it('invalid body with base path', function () {
                let schemaEndpoint = schema['/v1/pets']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: [{
                        id: 321, name: []
                    }]});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".body[0].name",
                        "keyword": "type",
                        "message": "should be string",
                        "params": {
                            "type": "string"
                        },
                        "schemaPath": "#/body/items/properties/name/type"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
        });

        describe('Inheritance', function () {
            let schema;
            before(() => {
                const swaggerPath = path.join(__dirname, './pets-response-inheritance.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath)
                    .then((receivedSchema) => {
                        schema = receivedSchema;
                    })
            });

            it('should pass', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        petType: 'Dog',
                        name: 'name',
                        packSize: 3
                    }});

                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(validatorMatch).to.be.true;
            });
            it('should fail for wrong value in discriminator', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        petType: 'dog',
                        name: 'name',
                        tag: 'tag',
                        test: {
                            field1: '1234'
                        }
                    }});

                const customError = new InputValidationError(schemaEndpoint.errors,
                    { beautifyErrors: true, firstError: true });
                expect(customError.errors).to.be.equal("body/body.petType should be equal to one of the allowed values [Cat,Dog]");
                expect(validatorMatch).to.be.false;
            });
            it('should fail for missing discriminator key', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({   body: {
                        name: 'name',
                        tag: 'tag',
                        test: {
                            field1: '1234'
                        }
                    }});

                const customError = new InputValidationError(schemaEndpoint.errors,
                    { beautifyErrors: true, firstError: true });
                expect(customError.errors).to.be.equal('body/body.petType should be equal to one of the allowed values [Cat,Dog]');
                expect(validatorMatch).to.be.false;
            });
            it('should fail for missing attribute in inherited object (Dog)', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({   body:{
                        petType: 'Dog',
                        name: 'name',
                        tag: 'tag',
                        test: {
                            field1: '1234'
                        }
                    }});

                const customError = new InputValidationError(schemaEndpoint.errors,
                    { beautifyErrors: true, firstError: true });
                expect(customError.errors).to.be.equal('body/body should have required property \'packSize\'');
                expect(validatorMatch).to.be.false;
            });
            it('should fail for missing attribute in inherited object (cat)', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({   body:{
                        petType: 'Cat',
                        name: 'name',
                        tag: 'tag',
                        test: {
                            field1: '1234'
                        }
                    }});

                const customError = new InputValidationError(schemaEndpoint.errors,
                    { beautifyErrors: true, firstError: true });
                expect(customError.errors).to.be.eql('body/body should have required property \'huntingSkill\'');
                expect(validatorMatch).to.be.false;

            });
            it('should fail for missing attribute in inherited object (parent)', function () {
                let schemaEndpoint = schema['/pets']['post'].responses['201'];
                let validatorMatch = schemaEndpoint.validate({   body:{
                        petType: 'Dog',
                        tag: 'tag',
                        chip_number: '123454'
                    }});

                const customError = new InputValidationError(schemaEndpoint.errors,
                    { beautifyErrors: true, firstError: true });
                expect(customError.errors).to.be.equal('body/body should have required property \'name\'');
                expect(validatorMatch).to.be.false;

            });
        });

        //todo not support yet in files
        //describe.skip('FormData', function () {});
    });
    describe('check headers', function () {
        describe('without base path', function () {
            let schemaEndpoint, schema;
            before(() => {
                const swaggerPath = path.join(__dirname, './pets-response.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath, {
                    ajvConfigBody: true
                })
                    .then((receivedSchema) => {
                        schema = receivedSchema;
                    })
            });

            //todo - doesnt support, update kobi
            //it.skip('missing header - should fail', function () {

            it('bad header - wrong type', function () {
                schemaEndpoint = schema['/pet-with-header']['get'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers:{
                        'x-next': []
                    }});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".headers['x-next']",
                        "keyword": "type",
                        "message": "should be string",
                        "params": {
                            "type": "string"
                        },
                        "schemaPath": "#/headers/properties/x-next/type"
                    }
                ]);
                expect(isValid).to.be.false;
            });
            it('bad header - invalid pattern', function () {
                schemaEndpoint = schema['/pet-with-header']['get'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers:{
                        'pattern-header': '1dsa'
                    }});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".headers['pattern-header']",
                        "keyword": "pattern",
                        "message": "should match pattern \"^\\d{1,3}\\.\\d{1,3}$\"",
                        "params": {
                            "pattern": "^\\d{1,3}\\.\\d{1,3}$"
                        },
                        "schemaPath": "#/headers/properties/pattern-header/pattern"
                    }
                ]);
                expect(isValid).to.be.false;
            });
            it('bad header - empty header', function () {
                schemaEndpoint = schema['/pet-with-header']['get'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers:{
                        'minlength-header': ''
                    }});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".headers['minlength-header']",
                        "keyword": "minLength",
                        "message": "should NOT be shorter than 1 characters",
                        "params": {
                            "limit": 1
                        },
                        "schemaPath": "#/headers/properties/minlength-header/minLength"
                    }
                ]);
                expect(isValid).to.be.false;
            });
            it('valid header', function () {
                schemaEndpoint = schema['/pet-with-header']['get'].responses['200'];

                let isValid = schemaEndpoint.validate({
                    headers:{
                        'minlength-header': 'aa',
                        'pattern-header': '1.0'
                    }});

                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(isValid).to.be.true;
            });
        });
        describe('with base path', function () {
            let schema;
            before(() => {
                const swaggerPath = path.join(__dirname, './pets-response-with-base-path.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath)
                    .then((receivedSchema) => {
                        schema = receivedSchema;
                    })
            });
            it('valid headers with base path', function () {
                let schemaEndpoint = schema['/v1/pets']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: [{
                        id: 321, name: 'kitty'
                    }],
                headers:{
                    'x-next': 123
                }});

                expect(schemaEndpoint.errors).to.be.equal(null);
                expect(validatorMatch).to.be.true;
            });

            it('invalid headers with base path', function () {
                let schemaEndpoint = schema['/v1/pets']['get'].responses['200'];
                let validatorMatch = schemaEndpoint.validate({   body: [{
                        id: 321, name: 'kitty'
                    }], headers:{
                        'x-next': []
                    }});

                expect(schemaEndpoint.errors).to.be.eql([
                    {
                        "dataPath": ".headers['x-next']",
                        "keyword": "type",
                        "message": "should be string",
                        "params": {
                            "type": "string"
                        },
                        "schemaPath": "#/headers/properties/x-next/type"
                    }
                ]);
                expect(validatorMatch).to.be.false;
            });
        });
    });
    describe('check options' , () => {
        describe('contentTypeValidation option', () => {
            describe('contentTypeValidation = true', () => {
                let schemaEndpoint, schema;
                before(() => {
                    const swaggerPath = path.join(__dirname, './pets-response.yaml');
                    return schemaValidatorGenerator.buildSchema(swaggerPath, {
                        contentTypeValidation: true
                    })
                        .then((receivedSchema) => {
                            schema = receivedSchema;
                        })
                });
                it('more detailed content-type - should pass validation', function () {
                    schemaEndpoint = schema['/pet-with-header']['get'].responses['200'];
                    //todo - should I validate content type only if content-length bigger then 1?
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

                    expect(schemaEndpoint.errors[0].errors.message).to.be.equal("content-type must be one of text/html,text/plain")
                    expect(schemaEndpoint.errors[0].errors.params['content-type']).to.be.equal("application/x-www-form-urlencoded")

                    expect(isValid).to.be.false;
                });
            });
            describe('contentTypeValidation = false', () => {
                let schemaEndpoint, schema;
                before(() => {
                    const swaggerPath = path.join(__dirname, './pets-response.yaml');
                    return schemaValidatorGenerator.buildSchema(swaggerPath, {
                        contentTypeValidation: false
                    })
                        .then((receivedSchema) => {
                            schema = receivedSchema;
                        })
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
        })
        describe.skip('type coercion option', function () {
            let testerFactory, options = {
                ajvConfigBody: {
                    coerceTypes: true,
                    // useDefaults: true
                },
                // makeOptionalAttributesNullable: true
            };
            before(function () {
                const swaggerPath = path.join(__dirname, './yaml/pet-store.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                    receivedSchema
                })

            });
            it('request with wrong parameter type - should pass validation due to coercion', function (done) {
                testerFactory.createTester()
                    .put('/pets')
                    .send([{
                        name: 1,
                        tag: 'tag',
                        test: {
                            field1: 'enum1'
                        }
                    }])
                    .expect(200, done);
            });
            it('request with wrong parameter type - should keep null values as null when payload is array', function (done) {
                testerFactory.createTester()
                    .put('/pets')
                    .send([{
                        name: 1,
                        tag: 'tag',
                        age: null,
                        test: {
                            field1: 'enum1',
                            field2: null
                        }
                    }])
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        const pet = res.body.receivedParams[0];
                        expect(pet.test.field2).to.be.null;
                        expect(pet.age).to.be.null;
                        done();
                    });
            });
            it('handles request body objects without specified schema correctly', function (done) {
                testerFactory.createTester()
                    .put('/pets')
                    .send([{
                        name: 1,
                        tag: 'tag',
                        age: null,
                        test: {
                            field1: 'enum1'
                        },
                        test2: {
                            arbitraryField: 'dummy',
                            nullField: null
                        }
                    }])
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        const pet = res.body.receivedParams[0];
                        expect(pet.test2.arbitraryField).to.equal('dummy');
                        expect(pet.test2.nullField).to.be.null;
                        done();
                    });
            });
            it('handles request body without specified schema correctly', function (done) {
                testerFactory.createTester()
                    .patch('/pets')
                    .send({
                        name: 1,
                        tag: 'tag',
                        age: null,
                        test: {
                            field1: 'enum1'
                        },
                        test2: {
                            arbitraryField: 'dummy',
                            nullField: null
                        }
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        const pet = res.body.receivedParams;
                        expect(pet.test.field1).to.equal('enum1');
                        expect(pet.test2.arbitraryField).to.equal('dummy');
                        expect(pet.test2.nullField).to.be.null;
                        done();
                    });
            });
            it('request with wrong parameter type - should keep null values as null when payload is object', function (done) {
                testerFactory.createTester()
                    .post('/pets')
                    .send({
                        name: 1,
                        tag: 'tag',
                        age: null,
                        test: {
                            field1: 'enum1',
                            field2: null
                        }
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        const pet = res.body.receivedParams;
                        expect(pet.test.field2).to.be.null;
                        expect(pet.age).to.be.null;
                        done();
                    });
            });
            it('request with wrong parameter type and no required fields defined - should keep null values as null when payload is object', function (done) {
                testerFactory.createTester()
                    .post('/pets')
                    .send({
                        name: 1,
                        tag: 'tag',
                        age: null,
                        test: {
                            field1: 'enum1'
                        },
                        test3: {
                            field1: 'enum1',
                            field2: null
                        }
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        const pet = res.body.receivedParams;
                        expect(pet.test3.field1).to.equal('enum1');
                        expect(pet.test3.field2).to.be.null;
                        expect(pet.age).to.be.null;
                        done();
                    });
            });
            it('request with wrong parameter type - should keep null values as null when (invalid) swagger with multiple types is provided', function (done) {
                testerFactory.createTester()
                    .put('/pets')
                    .send([{
                        name: 1,
                        tag: 'tag',
                        test: {
                            field1: 'enum1',
                            field3: null
                        }
                    }])
                    .expect(200)
                    .end(function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        const pet = res.body.receivedParams[0];
                        expect(pet.test.field3).to.be.null;
                        done();
                    });
            });
        });
        describe.skip('Keywords', function () {
            const definition = {
                type: 'object',
                macro: function (schema) {
                    if (schema.length === 0) return true;
                    if (schema.length === 1) return {not: {required: schema}};
                    var schemas = schema.map(function (prop) {
                        return {required: [prop]};
                    });
                    return {not: {anyOf: schemas}};
                },
                metaSchema: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            };

            var range = require('ajv-keywords/keywords/range');
            let testerFactory, options = {
                keywords: [range, { name: 'prohibited', definition }],
                expectFormFieldsInBody: true
            };
            before(function () {
                const swaggerPath = path.join(__dirname, './yaml/custom-keywords-swagger.yaml');
                return schemaValidatorGenerator.buildSchema(swaggerPath,options).then(receivedSchema => {
                    testerFactory = new TesterFactory(receivedSchema, options)
                })

            });
            it('should pass the validation by the range keyword', function (done) {
                testerFactory.createTester()
                    .post('/keywords')
                    .send({ age: 20 })
                    .expect(200, function (err, res) {
                        if (err) {
                            throw err;
                        }
                        expect(res.body.result).to.equal('OK');
                        done();
                    });
            });
            it('should be failed by the range keyword', function (done) {
                testerFactory.createTester()
                    .post('/keywords')
                    .send({ age: 50 })
                    .expect(400, function (err, res) {
                        if (err) {
                            throw err;
                        }
                        expect(res.body.more_info).to.includes('body/age should be <= 30');
                        done();
                    });
            });
            it('should be failed by the prohibited keyword', function (done) {
                testerFactory.createTester()
                    .post('/keywords')
                    .send({ ages: 20, age: 20 })
                    .expect(400, function (err, res) {
                        if (err) {
                            throw err;
                        }
                        expect(res.body.more_info).to.includes('body should NOT be valid');
                        done();
                    });
            });
        });
    });
});



