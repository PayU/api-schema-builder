var chai = require('chai'),
    expect = chai.expect,
    path = require('path'),
    schemaValidatorGenerator = require('../../../src/index'),
    { validateParams, validateBody } = require('../utils/schemaWrapper'),
    chaiLike = require('chai-like');

chai.use(chaiLike);

describe('oas2 - tests', () => {
    describe('init function tests', function () {
        it('should reject the promise in case the file doesn\'t exists', function () {
            return schemaValidatorGenerator.buildSchema('test/pet-store-swagger1.yaml', {
                ajvConfigBody: true
            })
                .catch(function (err) {
                    expect(err).to.exist;
                });
        });
        it('should resolve without formats', function () {
            const swaggerPath = path.join(__dirname, './yaml/pet-store-swagger.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath);
        });
    });

    describe('Simple server - no options', function () {
        let schemas;
        let options = {};
        before(function () {
            const swaggerPath = path.join(__dirname, './yaml/pet-store-swagger.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                schemas = receivedSchema;
            });
        });
        it('valid request - should pass validation', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'api-version': '1.0', 'request-id': '123456' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('missing header - should fail', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '123456' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '.headers',
                'schemaPath': '#/properties/headers/required',
                'params': { 'missingProperty': 'api-version' },
                'message': 'should have required property \'api-version\''
            }]);
        });
        it('bad header - invalid pattern', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '123456', 'api-version': '1' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'pattern',
                'dataPath': '.headers[\'api-version\']',
                'schemaPath': '#/properties/headers/properties/api-version/pattern',
                'params': { 'pattern': '^\\d{1,3}\\.\\d{1,3}$' },
                'message': 'should match pattern "^\\d{1,3}\\.\\d{1,3}$"'
            }]);
        });
        it('bad header - empty header', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'minLength',
                'dataPath': '.headers[\'request-id\']',
                'schemaPath': '#/properties/headers/properties/request-id/minLength',
                'params': { 'limit': 1 },
                'message': 'should NOT be shorter than 1 characters'
            }]);
        });
        it('bad body - wrong type', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': '111', 'tag': 12344, 'test': { 'field1': 'enum1' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([
                {
                    'dataPath': '.tag',
                    'keyword': 'type',
                    'message': 'should be string',
                    'params': {
                        'type': 'string'
                    },
                    'schemaPath': '#/properties/tag/type'
                }
            ]);
        });
        it('bad body - missing required params', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'tag': 'tag', 'test': { 'field1': 'enum2' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/required',
                'params': { 'missingProperty': 'name' },
                'message': 'should have required property \'name\''
            }]);
        });
        it('bad body - missing required object attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag' },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/required',
                'params': { 'missingProperty': 'test' },
                'message': 'should have required property \'test\''
            }]);
        });
        it('bad body - wrong type object attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': '' },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.test',
                'schemaPath': '#/properties/test/type',
                'params': { 'type': 'object' },
                'message': 'should be object'
            }]);
        });
        it('bad body - missing required nested attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': {} },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '.test',
                'schemaPath': '#/properties/test/required',
                'params': { 'missingProperty': 'field1' },
                'message': 'should have required property \'field1\''
            }]);
        });
        it('bad body - wrong format nested attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': 1234 } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong enum value', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': 'field1' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'enum',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad query param - missing required params', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 100 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad query param - over limit', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 150, 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad query param - under limit', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 0, 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad path param - wrong format', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: { 'petId': '12' },
                queries: { 'limit': '50', 'page': 0 },
                files: [],
                path: '/pets/:petId',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'minLength',
                'dataPath': '.path.petId',
                'schemaPath': '#/properties/path/properties/petId/minLength',
                'params': { 'limit': 3 },
                'message': 'should NOT be shorter than 3 characters'
            }]);
        });
        it('bad body - wrong format nested attribute (not parameters)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 'name', 'tag': 'tag', 'test': { 'field1': 1234 } }],
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '[0].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '[0].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong format in array item body (second item)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 'name', 'tag': 'tag', 'test': { 'field1': 'enum1' } }, {
                    'name': 'name',
                    'tag': 'tag',
                    'test': { 'field1': 1234 }
                }],
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '[1].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '[1].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong format body (should be an array)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': '1234' } },
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '',
                'schemaPath': '#/type',
                'params': { 'type': 'array' },
                'message': 'should be array'
            }]);
        });
    });
    describe('Simple server - type coercion enabled', function () {
        let schemas;
        let options = {
            ajvConfigBody: {
                coerceTypes: true,
                useDefaults: true
            },
            makeOptionalAttributesNullable: true
        };
        before(function () {
            const swaggerPath = path.join(__dirname, './yaml/pet-store-swagger.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                schemas = receivedSchema;
            });
        });
        it('request with wrong parameter type - should pass validation due to coercion', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 1, 'tag': 'tag', 'test': { 'field1': 'enum1' } }],
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql(undefined);
        });
        it('request with wrong parameter type - should keep null values as null when payload is array', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 1, 'tag': 'tag', 'age': null, 'test': { 'field1': 'enum1', 'field2': null } }],
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql(undefined);
        });
        it('handles request body objects without specified schema correctly', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{
                    'name': 1,
                    'tag': 'tag',
                    'age': null,
                    'test': { 'field1': 'enum1' },
                    'test2': { 'arbitraryField': 'dummy', 'nullField': null }
                }],
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql(undefined);
        });
        it('handles request body without specified schema correctly', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: {
                    'name': 1,
                    'tag': 'tag',
                    'age': null,
                    'test': { 'field1': 'enum1' },
                    'test2': { 'arbitraryField': 'dummy', 'nullField': null }
                },
                path: '/pets',
                method: 'patch'
            });
            expect(bodyValidationErrors).to.eql(undefined);
        });
        it('request with wrong parameter type - should keep null values as null when payload is object', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 1, 'tag': 'tag', 'age': null, 'test': { 'field1': 'enum1', 'field2': null } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql(undefined);
        });
        it('request with wrong parameter type and no required fields defined - should keep null values as null when payload is object', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: {
                    'name': 1,
                    'tag': 'tag',
                    'age': null,
                    'test': { 'field1': 'enum1' },
                    'test3': { 'field1': 'enum1', 'field2': null }
                },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql(undefined);
        });
        it('request with wrong parameter type - should keep null values as null when (invalid) swagger with multiple types is provided', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 1, 'tag': 'tag', 'test': { 'field1': 'enum1', 'field3': null } }],
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql(undefined);
        });
    });
    describe('Simple server - with base path', function () {
        let schemas;
        let options = { contentTypeValidation: true };
        before(function () {
            const swaggerPath = path.join(__dirname, './yaml/pet-store-swagger-with-base-path.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                schemas = receivedSchema;
            });
        });
        it('valid request - should pass validation', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'api-version': '1.0', 'request-id': '123456' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/v1/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad request - wrong content-type (should be application/json)', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'content-length': 1, 'content-type': 'application/x-www-form-urlencoded' },
                pathParams: {},
                queries: {},
                files: [],
                path: '/v1/pets',
                method: 'put'
            });
            expect(paramsValidationErrors[0].errors.message).to.equal('content-type must be one of application/json');

            expect(paramsValidationErrors[0].errors.params['content-type']).to.eql('application/x-www-form-urlencoded');

            expect(paramsValidationErrors[0].errors.params.types).to.eql([
                'application/json'
            ]);
        });
        it('headers are in lowercase letters - should pass validation', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'capital-letters': '1.0' },
                pathParams: {},
                queries: {},
                files: [],
                path: '/v1/capital',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('missing header - should fail', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '123456' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/v1/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '.headers',
                'schemaPath': '#/properties/headers/required',
                'params': { 'missingProperty': 'api-version' },
                'message': 'should have required property \'api-version\''
            }]);
        });
        it('bad header - invalid pattern', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '123456', 'api-version': '1' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/v1/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'pattern',
                'dataPath': '.headers[\'api-version\']',
                'schemaPath': '#/properties/headers/properties/api-version/pattern',
                'params': { 'pattern': '^\\d{1,3}\\.\\d{1,3}$' },
                'message': 'should match pattern "^\\d{1,3}\\.\\d{1,3}$"'
            }]);
        });
        it('bad header - empty header', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/v1/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'minLength',
                'dataPath': '.headers[\'request-id\']',
                'schemaPath': '#/properties/headers/properties/request-id/minLength',
                'params': { 'limit': 1 },
                'message': 'should NOT be shorter than 1 characters'
            }]);
        });
        it('bad body - wrong type', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': '111', 'tag': 12344, 'test': { 'field1': 'enum2' } },
                path: '/v1/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.tag',
                'schemaPath': '#/properties/tag/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }]);
        });
        it('bad body - missing required params', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'tag': 'tag', 'test': { 'field1': 'enum2' } },
                path: '/v1/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/required',
                'params': { 'missingProperty': 'name' },
                'message': 'should have required property \'name\''
            }]);
        });
        it('bad body - missing required object attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag' },
                path: '/v1/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/required',
                'params': { 'missingProperty': 'test' },
                'message': 'should have required property \'test\''
            }]);
        });
        it('bad body - wrong type object attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': '' },
                path: '/v1/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.test',
                'schemaPath': '#/properties/test/type',
                'params': { 'type': 'object' },
                'message': 'should be object'
            }]);
        });
        it('bad body - missing required nested attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': {} },
                path: '/v1/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '.test',
                'schemaPath': '#/properties/test/required',
                'params': { 'missingProperty': 'field1' },
                'message': 'should have required property \'field1\''
            }]);
        });
        it('bad body - wrong format nested attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': 1234 } },
                path: '/v1/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong enum value', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': 'field1' } },
                path: '/v1/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'enum',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad query param - missing required params', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 100 },
                files: [],
                path: '/v1/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad query param - over limit', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 150, 'page': 0 },
                files: [],
                path: '/v1/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad query param - under limit', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 0, 'page': 0 },
                files: [],
                path: '/v1/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad path param - wrong format', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: { 'petId': '12' },
                queries: { 'limit': '50', 'page': 0 },
                files: [],
                path: '/v1/pets/:petId',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'minLength',
                'dataPath': '.path.petId',
                'schemaPath': '#/properties/path/properties/petId/minLength',
                'params': { 'limit': 3 },
                'message': 'should NOT be shorter than 3 characters'
            }]);
        });
        it('bad body - wrong format nested attribute (not parameters)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 'name', 'tag': 'tag', 'test': { 'field1': 1234 } }],
                path: '/v1/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '[0].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '[0].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong format in array item body (second item)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 'name', 'tag': 'tag', 'test': { 'field1': 'enum1' } }, {
                    'name': 'name',
                    'tag': 'tag',
                    'test': { 'field1': 1234 }
                }],
                path: '/v1/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '[1].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '[1].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong format body (should be an array)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': '1234' } },
                path: '/v1/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '',
                'schemaPath': '#/type',
                'params': { 'type': 'array' },
                'message': 'should be array'
            }]);
        });
    });
    describe('Simple server using routes', function () {
        let schemas;
        let options = {};
        before(function () {
            const swaggerPath = path.join(__dirname, './yaml/pet-store-swagger.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                schemas = receivedSchema;
            });
        });

        it('valid request - should pass validation', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'api-version': '1.0', 'request-id': '123456' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('missing header - should fail', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '123456' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '.headers',
                'schemaPath': '#/properties/headers/required',
                'params': { 'missingProperty': 'api-version' },
                'message': 'should have required property \'api-version\''
            }]);
        });
        it('bad header - invalid pattern', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '123456', 'api-version': '1' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'pattern',
                'dataPath': '.headers[\'api-version\']',
                'schemaPath': '#/properties/headers/properties/api-version/pattern',
                'params': { 'pattern': '^\\d{1,3}\\.\\d{1,3}$' },
                'message': 'should match pattern "^\\d{1,3}\\.\\d{1,3}$"'
            }]);
        });
        it('bad header - empty header', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'minLength',
                'dataPath': '.headers[\'request-id\']',
                'schemaPath': '#/properties/headers/properties/request-id/minLength',
                'params': { 'limit': 1 },
                'message': 'should NOT be shorter than 1 characters'
            }]);
        });
        it('bad body - wrong type', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': '111', 'tag': 12344, 'test': { 'field1': 'enum2' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.tag',
                'schemaPath': '#/properties/tag/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }]);
        });
        it('bad body - missing required params', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'tag': 'tag', 'test': { 'field1': 'enum2' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/required',
                'params': { 'missingProperty': 'name' },
                'message': 'should have required property \'name\''
            }]);
        });
        it('bad body - missing required object attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag' },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/required',
                'params': { 'missingProperty': 'test' },
                'message': 'should have required property \'test\''
            }]);
        });
        it('bad body - wrong type object attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': '' },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.test',
                'schemaPath': '#/properties/test/type',
                'params': { 'type': 'object' },
                'message': 'should be object'
            }]);
        });
        it('bad body - missing required nested attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': {} },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '.test',
                'schemaPath': '#/properties/test/required',
                'params': { 'missingProperty': 'field1' },
                'message': 'should have required property \'field1\''
            }]);
        });
        it('bad body - wrong format nested attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': 1234 } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong enum value', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': 'field1' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'enum',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad query param - missing required params', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 100 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad query param - over limit', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 150, 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad query param - under limit', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 0, 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad path param - wrong format', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: { 'petId': '12' },
                queries: { 'limit': '50', 'page': 0 },
                files: [],
                path: '/pets/:petId',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'minLength',
                'dataPath': '.path.petId',
                'schemaPath': '#/properties/path/properties/petId/minLength',
                'params': { 'limit': 3 },
                'message': 'should NOT be shorter than 3 characters'
            }]);
        });
        it('bad body - wrong format nested attribute (not parameters)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 'name', 'tag': 'tag', 'test': { 'field1': 1234 } }],
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '[0].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '[0].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong format in array item body (second item)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 'name', 'tag': 'tag', 'test': { 'field1': 'enum1' } }, {
                    'name': 'name',
                    'tag': 'tag',
                    'test': { 'field1': 1234 }
                }],
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '[1].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '[1].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong format body (should be an array)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': '1234' } },
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '',
                'schemaPath': '#/type',
                'params': { 'type': 'array' },
                'message': 'should be array'
            }]);
        });
    });
    describe('Server with options', function () {
        let schemas;
        let options = {
            formats: [
                { name: 'double', pattern: /\d+(\.\d+)?/ },
                { name: 'int64', pattern: /^\d{1,19}$/ },
                { name: 'int32', pattern: /^\d{1,10}$/ }
            ],
            contentTypeValidation: true
        };
        before(function () {
            const swaggerPath = path.join(__dirname, './yaml/pet-store-swagger.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                schemas = receivedSchema;
            });
        });

        it('valid request - should pass validation', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'api-version': '1.0', 'request-id': '123456' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('missing header - should fail', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '123456' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '.headers',
                'schemaPath': '#/properties/headers/required',
                'params': { 'missingProperty': 'api-version' },
                'message': 'should have required property \'api-version\''
            }]);
        });
        it('bad header - invalid pattern', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '123456', 'api-version': '1' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'pattern',
                'dataPath': '.headers[\'api-version\']',
                'schemaPath': '#/properties/headers/properties/api-version/pattern',
                'params': { 'pattern': '^\\d{1,3}\\.\\d{1,3}$' },
                'message': 'should match pattern "^\\d{1,3}\\.\\d{1,3}$"'
            }]);
        });
        it('bad header - empty header', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'minLength',
                'dataPath': '.headers[\'request-id\']',
                'schemaPath': '#/properties/headers/properties/request-id/minLength',
                'params': { 'limit': 1 },
                'message': 'should NOT be shorter than 1 characters'
            }]);
        });
        it('bad body - wrong type', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': '111', 'tag': 12344, 'test': { 'field1': 'enum2' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.tag',
                'schemaPath': '#/properties/tag/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }]);
        });
        it('bad body - missing required params', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'tag': 'tag', 'test': { 'field1': 'enum2' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/required',
                'params': { 'missingProperty': 'name' },
                'message': 'should have required property \'name\''
            }]);
        });
        it('bad body - missing required object attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag' },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/required',
                'params': { 'missingProperty': 'test' },
                'message': 'should have required property \'test\''
            }]);
        });
        it('bad body - wrong type object attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': '' },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.test',
                'schemaPath': '#/properties/test/type',
                'params': { 'type': 'object' },
                'message': 'should be object'
            }]);
        });
        it('bad body - missing required nested attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': {} },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '.test',
                'schemaPath': '#/properties/test/required',
                'params': { 'missingProperty': 'field1' },
                'message': 'should have required property \'field1\''
            }]);
        });
        it('bad body - wrong format nested attribute', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': 1234 } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong enum value', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': 'field1' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'enum',
                'dataPath': '.test.field1',
                'schemaPath': '#/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad query param - missing required params', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 100 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad query param - over limit', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 150, 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad query param - under limit', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: {},
                queries: { 'limit': 0, 'page': 0 },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('bad path param - wrong format', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: { 'petId': '12' },
                queries: { 'limit': '50', 'page': 0 },
                files: [],
                path: '/pets/:petId',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'minLength',
                'dataPath': '.path.petId',
                'schemaPath': '#/properties/path/properties/petId/minLength',
                'params': { 'limit': 3 },
                'message': 'should NOT be shorter than 3 characters'
            }]);
        });
        it('bad body - wrong format nested attribute (not parameters)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 'name', 'tag': 'tag', 'test': { 'field1': 1234 } }],
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '[0].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '[0].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong format in array item body (second item)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: [{ 'name': 'name', 'tag': 'tag', 'test': { 'field1': 'enum1' } }, {
                    'name': 'name',
                    'tag': 'tag',
                    'test': { 'field1': 1234 }
                }],
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '[1].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/type',
                'params': { 'type': 'string' },
                'message': 'should be string'
            }, {
                'keyword': 'enum',
                'dataPath': '[1].test.field1',
                'schemaPath': '#/items/properties/test/properties/field1/enum',
                'params': { 'allowedValues': ['enum1', 'enum2'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('bad body - wrong format body (should be an array)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': '1234' } },
                path: '/pets',
                method: 'put'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'type',
                'dataPath': '',
                'schemaPath': '#/type',
                'params': { 'type': 'array' },
                'message': 'should be array'
            }]);
        });
        it('bad request - wrong content-type (should be application/json)', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'content-length': 1, 'content-type': 'application/x-www-form-urlencoded' },
                pathParams: {},
                queries: {},
                files: [],
                path: '/pets',
                method: 'put'
            });

            expect(paramsValidationErrors[0].errors.message).to.equal('content-type must be one of application/json,form-data');

            expect(paramsValidationErrors[0].errors.params['content-type']).to.eql('application/x-www-form-urlencoded');

            expect(paramsValidationErrors[0].errors.params.types).to.eql([
                'application/json',
                'form-data'
            ]);
        });
        it('valid content-type when multiple content-types defined - should pass validation', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'content-type': 'text/plain', 'content-length': '1' },
                pathParams: {},
                queries: {},
                files: [],
                path: '/text',
                method: 'put'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('more detailed content-type - should pass validation', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'content-type': 'application/json; charset=utf-8', 'content-length': '1' },
                pathParams: {},
                queries: {},
                files: [],
                path: '/pets',
                method: 'put'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('valid empty request - should pass validation', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'request-id': '1234', 'api-version': '1.0' },
                pathParams: { 'petId': '1234' },
                queries: {},
                files: [],
                path: '/pets/:petId',
                method: 'put'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
    });
    describe('Formats', function(){
        let schemas;
        let options = {
            formats: [
                { name: 'abcName', pattern: /abc/ }
            ],
            contentTypeValidation: true
        };
        before(function () {
            const swaggerPath = path.join(__dirname, './yaml/pet-store-swagger-formats.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                schemas = receivedSchema;
            });
        });
        it('bad body - wrong format body (should be an abcName format)', function () {
            let paramsValidationErrors = validateBody({
                schemas: schemas,
                body: { id: '111' },
                path: '/pets',
                method: 'get'
            });

            expect(paramsValidationErrors).to.eql([ { keyword: 'format',
                dataPath: '.id',
                schemaPath: '#/properties/id/format',
                params: { format: 'abcName' },
                message: 'should match format \'abcName\'' } ]);
        });

        it('valid body - good format', function () {
            let paramsValidationErrors = validateBody({
                schemas: schemas,
                body: { id: 'abc' },
                path: '/pets',
                method: 'get'
            });

            expect(paramsValidationErrors).to.eql(undefined);
        });
    });
    describe('Inheritance', function () {
        let schemas;
        let options = {
            formats: [
                { name: 'double', pattern: /\d+(\.\d+)?/ },
                { name: 'int64', pattern: /^\d{1,19}$/ },
                { name: 'int32', pattern: /^\d{1,10}$/ }
            ],
            beautifyErrors: true,
            firstError: true
        };
        before(function () {
            const swaggerPath = path.join(__dirname, './yaml/pet-store-swagger-inheritance.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                schemas = receivedSchema;
            });
        });
        it('should pass', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: {
                    petType: 'Dog',
                    name: 'name',
                    packSize: 3
                },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql(undefined);
        });
        it('wrong value for header with enum definition', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'api-version': '2.0' },
                pathParams: {},
                queries: {},
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'enum',
                'dataPath': '.headers[\'api-version\']',
                'schemaPath': '#/properties/headers/properties/api-version/enum',
                'params': { 'allowedValues': ['1.0', '1.1'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('wrong value for query with enum definition', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'api-version': '1.0' },
                pathParams: {},
                queries: { 'PetType': 'bird' },
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('missing header with enum definition', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: {},
                pathParams: {},
                queries: {},
                files: [],
                path: '/pets',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([
                {
                    'keyword': 'required',
                    'dataPath': '.headers',
                    'schemaPath': '#/properties/headers/required',
                    'params': {
                        'missingProperty': 'api-version'
                    },
                    'message': 'should have required property \'api-version\''
                }
            ]);
        });
        it('wrong value for path param with enum definition', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: {},
                pathParams: { 'version': 'v2', 'petId': '12345' },
                queries: {},
                files: [],
                path: '/:version/pets/:petId',
                method: 'get'
            });
            expect(paramsValidationErrors).to.eql([{
                'keyword': 'enum',
                'dataPath': '.path.version',
                'schemaPath': '#/properties/path/properties/version/enum',
                'params': { 'allowedValues': ['v1'] },
                'message': 'should be equal to one of the allowed values'
            }]);
        });
        it('should fail for wrong value in discriminator', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'petType': 'dog', 'name': 'name', 'tag': 'tag', 'test': { 'field1': '1234' } },
                path: '/pets',
                method: 'post'
            });

            expect(bodyValidationErrors[0].dataPath).to.equal('.petType');
            expect(bodyValidationErrors[0].params.allowedValues).to.eql([
                'Cat',
                'Dog'
            ]);
        });
        it('should fail for missing discriminator key', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'name': 'name', 'tag': 'tag', 'test': { 'field1': '1234' } },
                path: '/pets',
                method: 'post'
            });

            expect(bodyValidationErrors[0].dataPath).to.equal('.petType');
            expect(bodyValidationErrors[0].message).to.equal('should be equal to one of the allowed values');
            expect(bodyValidationErrors[0].params.allowedValues).to.eql([
                'Cat',
                'Dog'
            ]);
        });
        it('should fail for missing attribute in inherited object (Dog)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'petType': 'Dog', 'name': 'name', 'tag': 'tag', 'test': { 'field1': '1234' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/allOf/1/required',
                'params': { 'missingProperty': 'packSize' },
                'message': 'should have required property \'packSize\''
            }]);
        });
        it('should fail for missing attribute in inherited object (cat)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'petType': 'Cat', 'name': 'name', 'tag': 'tag', 'test': { 'field1': '1234' } },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/allOf/1/required',
                'params': { 'missingProperty': 'huntingSkill' },
                'message': 'should have required property \'huntingSkill\''
            }]);
        });
        it('should fail for missing attribute in inherited object (parent)', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'petType': 'Dog', 'tag': 'tag', 'chip_number': '123454' },
                path: '/pets',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/allOf/0/required',
                'params': { 'missingProperty': 'name' },
                'message': 'should have required property \'name\''
            }, {
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/allOf/1/required',
                'params': { 'missingProperty': 'packSize' },
                'message': 'should have required property \'packSize\''
            }]);
        });
    });
    describe('FormData', function () {
        let schemas;
        let options = {
            formats: [
                { name: 'double', pattern: /\d+(\.\d+)?/ },
                { name: 'int64', pattern: /^\d{1,19}$/ },
                { name: 'int32', pattern: /^\d{1,10}$/ },
                { name: 'file', validate: () => { return true } }
            ],
            beautifyErrors: true,
            firstError: true,
            expectFormFieldsInBody: true
        };
        before(function () {
            const swaggerPath = path.join(__dirname, './yaml/form-data-swagger.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                schemas = receivedSchema;
            });
        });
        it('only required files exists should pass', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'api-version': '1.0' },
                pathParams: {},
                queries: {},
                files: [{ 'fieldname': 'sourceFile' }],
                path: '/pets/import',
                method: 'post'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('required and optional files exists should pass', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'api-version': '1.0' },
                pathParams: {},
                queries: {},
                files: [{ 'fieldname': 'sourceFile' }, { 'fieldname': 'optionalFile' }],
                path: '/pets/import',
                method: 'post'
            });
            expect(paramsValidationErrors).to.eql(undefined);
        });
        it('missing required file should fail', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'api-version': '1.0' },
                pathParams: {},
                queries: {},
                files: [{ 'fieldname': 'sourceFile1' }],
                path: '/pets/import',
                method: 'post'
            });

            expect(paramsValidationErrors[0].errors.message).to.equal('Missing required files: sourceFile');
            expect(paramsValidationErrors[0].errors.params.requiredFiles).to.eql(['sourceFile']);
            expect(paramsValidationErrors[0].errors.params.missingFiles).to.eql(['sourceFile']);
            expect(paramsValidationErrors[0].dataPath).to.equal('.files');
        });
        it('extra files exists but not allowed should fail', function () {
            let paramsValidationErrors = validateParams({
                schemas: schemas,
                headers: { 'api-version': '1.0' },
                pathParams: {},
                queries: {},
                files: [{ 'fieldname': 'sourceFile1' }, { 'fieldname': 'sourceFile' }],
                path: '/pets/import',
                method: 'post'
            });

            expect(paramsValidationErrors[0].errors.message).to.equal('Extra files are not allowed. Not allowed files: sourceFile1');
            expect(paramsValidationErrors[0].errors.params.allowedFiles).to.eql(['sourceFile', 'optionalFile']);
            expect(paramsValidationErrors[0].errors.params.extraFiles).to.eql(['sourceFile1']);
            expect(paramsValidationErrors[0].dataPath).to.equal('.files');
        });
        it('supports string formData', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'username': 'user', 'password': 'pass' },
                path: '/login',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql(undefined);
        });
        it('validates string formData', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'username': 'user' },
                path: '/login',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'required',
                'dataPath': '',
                'schemaPath': '#/required',
                'params': { 'missingProperty': 'password' },
                'message': 'should have required property \'password\''
            }]);
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
        let schemas, options = {
            keywords: [range, { name: 'prohibited', definition }],
            beautifyErrors: true,
            firstError: true,
            expectFormFieldsInBody: true
        };
        before(function () {
            const swaggerPath = path.join(__dirname, './yaml/custom-keywords-swagger.yaml');
            return schemaValidatorGenerator.buildSchema(swaggerPath, options).then(receivedSchema => {
                schemas = receivedSchema;
            });
        });
        it('should pass the validation by the range keyword', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'age': 20 },
                path: '/keywords',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql(undefined);
        });
        it('should be failed by the range keyword', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'age': 50 },
                path: '/keywords',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'maximum',
                'dataPath': '.age',
                'schemaPath': '#/properties/age/maximum',
                'params': { 'comparison': '<=', 'limit': 30, 'exclusive': false },
                'message': 'should be <= 30'
            }, {
                'keyword': 'range',
                'dataPath': '.age',
                'schemaPath': '#/properties/age/range',
                'params': { 'keyword': 'range' },
                'message': 'should pass \'range\' keyword validation'
            }]);
        });
        it('should be failed by the prohibited keyword', function () {
            let bodyValidationErrors = validateBody({
                schemas: schemas,
                body: { 'ages': 20, 'age': 20 },
                path: '/keywords',
                method: 'post'
            });
            expect(bodyValidationErrors).to.eql([{
                'keyword': 'not',
                'dataPath': '',
                'schemaPath': '#/not',
                'params': {},
                'message': 'should NOT be valid'
            }, {
                'keyword': 'prohibited',
                'dataPath': '',
                'schemaPath': '#/prohibited',
                'params': { 'keyword': 'prohibited' },
                'message': 'should pass \'prohibited\' keyword validation'
            }]);
        });
    });
});
