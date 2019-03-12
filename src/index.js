'use strict';

var SwaggerParser = require('swagger-parser'),
    schemaPreprocessor = require('./utils/schema-preprocessor'),
    oas3 = require('./parsers/open-api3'),
    oas2 = require('./parsers/open-api2'),
    ajvUtils = require('./utils/ajv-utils'),
    Ajv = require('ajv'),
    sourceResolver = require('./utils/sourceResolver'),
    Validators = require('./validators/index');

/**
 * Initialize the input validation middleware
 * @param {string} swaggerPath - the path for the swagger file
 * @param {Object} options - options.formats to add formats to ajv, options.beautifyErrors, options.firstError, options.expectFormFieldsInBody, options.fileNameField (default is 'fieldname' - multer package), options.ajvConfigBody and options.ajvConfigParams for config object that will be passed for creation of Ajv instance used for validation of body and parameters appropriately
 */
function buildSchema(swaggerPath, options) {
    let schemas = {};
    let middlewareOptions = options || {};
    const makeOptionalAttributesNullable = middlewareOptions.makeOptionalAttributesNullable || false;

    return Promise.all([
        SwaggerParser.dereference(swaggerPath),
        SwaggerParser.parse(swaggerPath)
    ]).then(function (swaggers) {
        const dereferenced = swaggers[0];
        const referenced = swaggers[1];

        Object.keys(dereferenced.paths).forEach(function (currentPath) {
            let pathParameters = dereferenced.paths[currentPath].parameters || [];
            let parsedPath = dereferenced.basePath && dereferenced.basePath !== '/' ? dereferenced.basePath.concat(currentPath.replace(/{/g, ':').replace(/}/g, '')) : currentPath.replace(/{/g, ':').replace(/}/g, '');
            schemas[parsedPath] = {};
            Object.keys(dereferenced.paths[currentPath]).filter(function (parameter) { return parameter !== 'parameters' })
                .forEach(function (currentMethod) {
                    schemas[parsedPath][currentMethod.toLowerCase()] = {};
                    const isOpenApi3 = dereferenced.openapi === '3.0.0';
                    const parameters = dereferenced.paths[currentPath][currentMethod].parameters || [];
                    if (isOpenApi3){
                        schemas[parsedPath][currentMethod].body = oas3.buildBodyValidation(dereferenced, referenced, currentPath, currentMethod, middlewareOptions);
                    } else {
                        let bodySchema = middlewareOptions.expectFormFieldsInBody
                            ? parameters.filter(function (parameter) { return (parameter.in === 'body' || (parameter.in === 'formData' && parameter.type !== 'file')) })
                            : parameters.filter(function (parameter) { return parameter.in === 'body' });
                        if (makeOptionalAttributesNullable) {
                            schemaPreprocessor.makeOptionalAttributesNullable(bodySchema);
                        }
                        if (bodySchema.length > 0) {
                            const validatedBodySchema = oas2.getValidatedBodySchema(bodySchema);
                            let bodySchemaReference = referenced.paths[currentPath][currentMethod].parameters.filter(function (parameter) { return parameter.in === 'body' })[0];
                            let schemaReference = bodySchemaReference.schema['$ref'];
                            schemas[parsedPath][currentMethod].body = oas2.buildBodyValidation(validatedBodySchema, dereferenced.definitions, referenced, currentPath, currentMethod, parsedPath, middlewareOptions, schemaReference);
                        }
                    }

                    //response validation
                    schemas[parsedPath][currentMethod].responses = {};
                    let responses = dereferenced.paths[currentPath][currentMethod].responses;
                    Object.keys(responses).forEach(statusCode => {
                        if(statusCode !== 'default'){
                            let responseDereferenceSchema = responses[statusCode].schema;
                            let responseDereferenceHeaders = responses[statusCode].headers;
                            let headersValidator = responseDereferenceHeaders ? buildHeadersValidation(responseDereferenceHeaders, middlewareOptions) : undefined;

                            let responseSchema = referenced.paths[currentPath][currentMethod].responses[statusCode].schema;
                            let bodyValidator = responseSchema ? oas2.buildBodyValidation(responseDereferenceSchema, dereferenced.definitions, referenced, currentPath, currentMethod, parsedPath, middlewareOptions, responseSchema['$ref']) : undefined;

                            if(headersValidator || bodyValidator){
                                schemas[parsedPath][currentMethod].responses[statusCode] =  new Validators.ResponseValidator({body:bodyValidator,headers:headersValidator});
                            }

                        }
                    });

                    let localParameters = parameters.filter(function (parameter) {
                        return parameter.in !== 'body';
                    }).concat(pathParameters);

                    if (localParameters.length > 0 || middlewareOptions.contentTypeValidation) {
                        schemas[parsedPath][currentMethod].parameters = buildParametersValidation(localParameters,
                            dereferenced.paths[currentPath][currentMethod].consumes || dereferenced.paths[currentPath].consumes || dereferenced.consumes, middlewareOptions);
                    }
                });
        });
        return schemas;
    })
        .catch(function (error) {
            return Promise.reject(error);
        });
}

function createContentTypeHeaders(validate, contentTypes) {
    if (!validate || !contentTypes) return;

    return {
        types: contentTypes
    };
}

function buildParametersValidation(parameters, contentTypes, middlewareOptions) {
    const defaultAjvOptions = {
        allErrors: true,
        coerceTypes: 'array'
        // unknownFormats: 'ignore'
    };
    const options = Object.assign({}, defaultAjvOptions, middlewareOptions.ajvConfigParams);
    let ajv = new Ajv(options);

    ajvUtils.addCustomKeyword(ajv, middlewareOptions.formats);

    var ajvParametersSchema = {
        title: 'HTTP parameters',
        type: 'object',
        additionalProperties: false,
        properties: {
            headers: {
                title: 'HTTP headers',
                type: 'object',
                properties: {},
                additionalProperties: true
                // plural: 'headers'
            },
            path: {
                title: 'HTTP path',
                type: 'object',
                properties: {},
                additionalProperties: false
            },
            query: {
                title: 'HTTP query',
                type: 'object',
                properties: {},
                additionalProperties: false
            },
            files: {
                title: 'HTTP form files',
                files: {
                    required: [],
                    optional: []
                }
            }
        }
    };

    parameters.forEach(parameter => {
        var data = Object.assign({}, parameter);

        const required = parameter.required;
        const source = sourceResolver.resolveParameterSource(parameter);
        const key = parameter.in === 'header' ? parameter.name.toLowerCase() : parameter.name;

        var destination = ajvParametersSchema.properties[source];

        delete data.name;
        delete data.in;
        delete data.required;

        if (data.type === 'file') {
            if (required){
                destination.files.required.push(key);
            } else {
                destination.files.optional.push(key);
            }
        } else if (source !== 'fields') {
            if (required) {
                destination.required = destination.required || [];
                destination.required.push(key);
            }
            destination.properties[key] = data;
        }
    }, this);

    ajvParametersSchema.properties.headers.content = createContentTypeHeaders(middlewareOptions.contentTypeValidation, contentTypes);

    return new Validators.SimpleValidator(ajv.compile(ajvParametersSchema));
}

//split to diff parsers if needed
function buildHeadersValidation(headers, middlewareOptions) {
    let ajv = new Ajv( {allErrors: true, coerceTypes: 'array', ...middlewareOptions.ajvConfigParams});
    ajvUtils.addCustomKeyword(ajv, middlewareOptions.formats);

    var ajvHeadersSchema = {
                title: 'HTTP headers',
                type: 'object',
                properties: {},
                required: [],
                additionalProperties: true
            };

    Object.keys(headers).forEach(key => {
        let headerObj = headers[key];
        const headerName = key.toLowerCase();
        ajvHeadersSchema.properties[headerName] = {description:headerObj.description, type: headerObj.type};
        headerObj.required && ajvHeadersSchema.required.push(key);
    }, this);

    //todo - should i need it?
   // ajvHeadersSchema.content = createContentTypeHeaders(middlewareOptions.contentTypeValidation, contentTypes);

    return new Validators.SimpleValidator(ajv.compile(ajvHeadersSchema));
}


module.exports = {
    buildSchema: buildSchema
};
