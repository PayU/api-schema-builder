'use strict';

const get = require('lodash.get');
const Ajv = require('ajv');
const SwaggerParser = require('swagger-parser');

const { defaultFormatsValidators } = require('./validators/formatValidators.js');
const schemaPreprocessor = require('./utils/schema-preprocessor');
const oai3 = require('./parsers/open-api3');
const oai2 = require('./parsers/open-api2');
const ajvUtils = require('./utils/ajv-utils');
const schemaUtils = require('./utils/schemaUtils');
const sourceResolver = require('./utils/sourceResolver');
const Validators = require('./validators/index');
const createContentTypeHeaders = require('./utils/createContentTypeHeaders');

const DEFAULT_OPTIONS = {
    buildRequests: true,
    buildResponses: true
};

function buildSchema(swaggerPath, options) {
    return Promise.all([
        SwaggerParser.dereference(swaggerPath),
        SwaggerParser.parse(swaggerPath)
    ]).then(function ([dereferencedJsonSchema, jsonSchema]) {
        return buildValidations(jsonSchema, dereferencedJsonSchema, options);
    });
}

function buildSchemaSync(pathOrSchema, options) {
    const { jsonSchema, dereferencedSchema } = schemaUtils.getSchemas(pathOrSchema, options);

    return buildValidations(jsonSchema, dereferencedSchema, options);
}

function buildValidations(referenced, dereferenced, receivedOptions) {
    const options = getOptions(receivedOptions);

    const schemas = {};
    Object.keys(dereferenced.paths).forEach(function (currentPath) {
        const parsedPath = dereferenced.basePath && dereferenced.basePath !== '/'
            ? dereferenced.basePath.concat(currentPath.replace(/{/g, ':').replace(/}/g, ''))
            : currentPath.replace(/{/g, ':').replace(/}/g, '');
        schemas[parsedPath] = {};
        Object.keys(dereferenced.paths[currentPath])
            .filter(function (parameter) { return parameter !== 'parameters' })
            .forEach(function (currentMethod) {
                const parsedMethod = currentMethod.toLowerCase();

                let requestValidator;
                if (options.buildRequests) {
                    requestValidator = buildRequestValidator(referenced, dereferenced, currentPath,
                        parsedPath, currentMethod, options);
                }

                let responseValidator;
                if (options.buildResponses) {
                    responseValidator = buildResponseValidator(referenced, dereferenced, currentPath, parsedPath, currentMethod, options);
                }

                schemas[parsedPath][parsedMethod] = Object.assign({}, requestValidator, { responses: responseValidator });
            });
    });
    return schemas;
}

function getOptions(opts = {}) {
    const formats = opts.formats
        ? defaultFormatsValidators.concat(opts.formats)
        : defaultFormatsValidators;

    return Object.assign(
        {},
        DEFAULT_OPTIONS,
        opts,
        { formats }
    );
}

function buildRequestValidator(referenced, dereferenced, currentPath, parsedPath, currentMethod, options) {
    const requestSchema = {};
    let localParameters = [];
    const pathParameters = dereferenced.paths[currentPath].parameters || [];
    const isOpenApi3 = schemaUtils.isOpenApi3(dereferenced);
    const parameters = dereferenced.paths[currentPath][currentMethod].parameters || [];
    if (isOpenApi3) {
        requestSchema.body = oai3.buildRequestBodyValidation(dereferenced, referenced, currentPath, currentMethod, options);
        localParameters = oai3.buildPathParameters(parameters, pathParameters);
    } else {
        const bodySchema = options.expectFormFieldsInBody
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

function buildResponseValidator(referenced, dereferenced, currentPath, parsedPath, currentMethod, options) {
    const responsesSchema = {};
    const isOpenApi3 = schemaUtils.isOpenApi3(dereferenced);
    const responses = get(dereferenced, `paths[${currentPath}][${currentMethod}].responses`);
    if (responses) {
        Object
            .keys(responses)
            .forEach(statusCode => {
                let headersValidator, bodyValidator;
                if (isOpenApi3) {
                    headersValidator = oai3.buildHeadersValidation(responses, statusCode, options);
                    bodyValidator = oai3.buildResponseBodyValidation(dereferenced, referenced,
                        currentPath, currentMethod, statusCode, options);
                } else {
                    const contentTypes = dereferenced.paths[currentPath][currentMethod].produces || dereferenced.paths[currentPath].produces || dereferenced.produces;
                    headersValidator = oai2.buildHeadersValidation(responses, contentTypes, statusCode, options);
                    bodyValidator = oai2.buildResponseBodyValidation(responses,
                        dereferenced.definitions, referenced, currentPath, currentMethod, statusCode, options);
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
    const ajv = new Ajv(ajvOptions);

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

    ajvParametersSchema.properties.headers.content = createContentTypeHeaders(options.contentTypeValidation, contentTypes);

    return new Validators.SimpleValidator(ajv.compile(ajvParametersSchema));
}

module.exports = {
    buildSchemaSync,
    buildSchema,
    buildValidations
};
