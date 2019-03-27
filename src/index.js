'use strict';

var SwaggerParser = require('swagger-parser'),
    schemaPreprocessor = require('./utils/schema-preprocessor'),
    oai3 = require('./parsers/open-api3'),
    oai2 = require('./parsers/open-api2'),
    ajvUtils = require('./utils/ajv-utils'),
    Ajv = require('ajv'),
    sourceResolver = require('./utils/sourceResolver'),
    Validators = require('./validators/index'),
    optionUtils = require('./utils/option-utils');

const DEFAULT_SETTINGS = {
    buildRequests: true,
    buildResponses: true
};
function buildSchema(swaggerPath, options) {
    let updatedOptions = Object.assign({}, DEFAULT_SETTINGS, options);
    return Promise.all([
        SwaggerParser.dereference(swaggerPath),
        SwaggerParser.parse(swaggerPath)
    ]).then(function ([dereferenced, referenced]) {
        return buildValidations(referenced, dereferenced, updatedOptions);
    });
}

function buildValidations(referenced, dereferenced, options) {
    const { buildRequests, buildResponses } = options;
    const schemas = {};
    Object.keys(dereferenced.paths).forEach(function (currentPath) {
        let parsedPath = dereferenced.basePath && dereferenced.basePath !== '/'
            ? dereferenced.basePath.concat(currentPath.replace(/{/g, ':').replace(/}/g, ''))
            : currentPath.replace(/{/g, ':').replace(/}/g, '');
        schemas[parsedPath] = {};
        Object.keys(dereferenced.paths[currentPath])
            .filter(function (parameter) { return parameter !== 'parameters' })
            .forEach(function (currentMethod) {
                let parsedMethod = currentMethod.toLowerCase();

                let requestValidator;
                if (buildRequests) {
                    requestValidator = buildRequestValidator(referenced, dereferenced, currentPath,
                        parsedPath, currentMethod, options);
                }

                let responseValidator;
                if (buildResponses) {
                    responseValidator = buildResponseValidator(referenced, dereferenced, currentPath, parsedPath, currentMethod, options);
                }

                schemas[parsedPath][parsedMethod] = Object.assign({}, requestValidator, { responses: responseValidator });
            });
    });
    return schemas;
}

function buildRequestValidator(referenced, dereferenced, currentPath, parsedPath, currentMethod, options){
    let requestSchema = {};
    let localParameters = [];
    let pathParameters = dereferenced.paths[currentPath].parameters || [];
    const isOpenApi3 = dereferenced.openapi === '3.0.0';
    const parameters = dereferenced.paths[currentPath][currentMethod].parameters || [];
    if (isOpenApi3) {
        requestSchema.body = oai3.buildRequestBodyValidation(dereferenced, referenced, currentPath, currentMethod, options);
        localParameters = oai3.buildPathParameters(parameters, pathParameters);
    } else {
        let bodySchema = options.expectFormFieldsInBody
            ? parameters.filter(function (parameter) {
                return (parameter.in === 'body' ||
                (parameter.in === 'formData' && parameter.type !== 'file'));
            })
            : parameters.filter(function (parameter) { return parameter.in === 'body' });

        options.makeOptionalAttributesNullable && schemaPreprocessor.makeOptionalAttributesNullable(bodySchema);

        if (bodySchema.length > 0) {
            const validatedBodySchema = oai2.getValidatedBodySchema(bodySchema);
            requestSchema.body = oai2.buildRequestBodyValidation(validatedBodySchema, dereferenced.definitions, referenced,
                currentPath, currentMethod, options);
        }

        localParameters = oai2.buildPathParameters(parameters, pathParameters);
    }

    if (localParameters.length > 0 || options.contentTypeValidation) {
        requestSchema.parameters = buildParametersValidation(localParameters,
            dereferenced.paths[currentPath][currentMethod].consumes || dereferenced.paths[currentPath].consumes || dereferenced.consumes, options);
    }

    return requestSchema;
}

function buildResponseValidator(referenced, dereferenced, currentPath, parsedPath, currentMethod, options){
    let responsesSchema = {};
    const isOpenApi3 = dereferenced.openapi === '3.0.0';
    let responses = dereferenced.paths[currentPath][currentMethod].responses;
    if (responses) {
        Object.keys(responses).forEach(statusCode => {
            let headersValidator, bodyValidator;
            if (isOpenApi3) {
                headersValidator = oai3.buildHeadersValidation(responses, options, statusCode);
                bodyValidator = oai3.buildResponseBodyValidation(dereferenced, referenced, currentPath, currentMethod, options, statusCode);
            } else {
                let contentTypes = dereferenced.paths[currentPath][currentMethod].produces || dereferenced.paths[currentPath].produces || dereferenced.produces;
                headersValidator = oai2.buildHeadersValidation(responses, contentTypes, options, statusCode);
                bodyValidator = oai2.buildResponseBodyValidation(responses,
                    dereferenced.definitions, referenced, currentPath, currentMethod, options, statusCode);
            }

            if (headersValidator || bodyValidator) {
                responsesSchema[statusCode] = new Validators.ResponseValidator({
                    body: bodyValidator,
                    headers: headersValidator
                });
            }
        });
    }

    return responsesSchema;
}

function buildParametersValidation(parameters, contentTypes, options) {
    const defaultAjvOptions = {
        allErrors: true,
        coerceTypes: 'array'
        // unknownFormats: 'ignore'
    };
    const ajvOptions = Object.assign({}, defaultAjvOptions, options.ajvConfigParams);
    let ajv = new Ajv(ajvOptions);

    ajvUtils.addCustomKeyword(ajv, options.formats, options.keywords);

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
            if (required) {
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
    });

    ajvParametersSchema.properties.headers.content = optionUtils.createContentTypeHeaders(options.contentTypeValidation, contentTypes);

    return new Validators.SimpleValidator(ajv.compile(ajvParametersSchema));
}

module.exports = {
    buildSchema,
    buildValidations
};
