
const Validators = require('../validators'),
    Ajv = require('ajv'),
    ajvUtils = require('../utils/ajv-utils'),
    createContentTypeHeaders = require('../utils/createContentTypeHeaders'),
    get = require('lodash.get');

module.exports = {
    getValidatedBodySchema,
    buildResponseBodyValidation,
    buildRequestBodyValidation,
    buildHeadersValidation,
    buildPathParameters
};

function buildPathParameters(parameters, pathParameters) {
    const localParameters = parameters.filter(function (parameter) {
        return parameter.in !== 'body';
    }).concat(pathParameters);
    return localParameters;
}

function getValidatedBodySchema(bodySchema) {
    let validatedBodySchema;
    if (bodySchema[0].in === 'body') {
        // if we are processing schema for a simple JSON payload, no additional processing needed
        validatedBodySchema = bodySchema[0].schema;
    } else if (bodySchema[0].in === 'formData') {
        // if we are processing multipart form, assemble body schema from form field schemas
        validatedBodySchema = {
            required: [],
            properties: {}
        };
        bodySchema.forEach((formField) => {
            if (formField.type !== 'file') {
                validatedBodySchema.properties[formField.name] = {
                    type: formField.type
                };
                if (formField.required) {
                    validatedBodySchema.required.push(formField.name);
                }
            }
        });
    }
    return validatedBodySchema;
}

function buildHeadersValidation(responses, contentTypes, statusCode, options) {
    const headers = get(responses, `[${statusCode}].headers`);
    if (!headers && !contentTypes) return;

    const defaultAjvOptions = {
        allErrors: true,
        coerceTypes: 'array'
    };
    const ajvOptions = Object.assign({}, defaultAjvOptions, options.ajvConfigParams);
    const ajv = new Ajv(ajvOptions);

    ajvUtils.addCustomKeyword(ajv, options.formats, options.keywords);

    var ajvHeadersSchema = {
        title: 'HTTP headers',
        type: 'object',
        properties: {},
        additionalProperties: true
    };

    if (headers) {
        Object.keys(headers).forEach(key => {
            const headerObj = Object.assign({}, headers[key]);
            const headerName = key.toLowerCase();
            delete headerObj.name;
            ajvHeadersSchema.properties[headerName] = headerObj;
        });
    }

    ajvHeadersSchema.content = createContentTypeHeaders(options.contentTypeValidation, contentTypes);

    return new Validators.SimpleValidator(ajv.compile(ajvHeadersSchema));
}

function buildAjvValidator(ajvConfigBody, formats, keywords){
    const defaultAjvOptions = {
        allErrors: true
    };
    const ajvOptions = Object.assign({}, defaultAjvOptions, ajvConfigBody);
    const ajv = new Ajv(ajvOptions);

    ajvUtils.addCustomKeyword(ajv, formats, keywords);
    return ajv;
}

function buildResponseBodyValidation(responses, swaggerDefinitions, originalSwagger, currentPath, currentMethod, statusCode, options) {
    const schema = get(responses, `[${statusCode}].schema`);
    if (!schema) return;

    const ajv = buildAjvValidator(options.ajvConfigBody, options.formats, options.keywords);

    if (schema.discriminator) {
        const referenceName = originalSwagger.paths[currentPath][currentMethod].responses[statusCode].schema.$ref;
        return buildInheritance(schema.discriminator, swaggerDefinitions, originalSwagger, ajv, referenceName);
    } else {
        return new Validators.SimpleValidator(ajv.compile(schema));
    }
}

function buildRequestBodyValidation(schema, swaggerDefinitions, originalSwagger, currentPath, currentMethod, options) {
    const ajv = buildAjvValidator(options.ajvConfigBody, options.formats, options.keywords);

    if (schema.discriminator) {
        const referenceName = originalSwagger.paths[currentPath][currentMethod].parameters.filter(function (parameter) { return parameter.in === 'body' })[0].schema.$ref;
        return buildInheritance(schema.discriminator, swaggerDefinitions, originalSwagger, ajv, referenceName);
    } else {
        return new Validators.SimpleValidator(ajv.compile(schema));
    }
}

function buildInheritance(discriminator, dereferencedDefinitions, swagger, ajv, referenceName) {
    var inheritsObject = {
        inheritance: []
    };
    inheritsObject.discriminator = discriminator;

    Object.keys(swagger.definitions).forEach(key => {
        if (swagger.definitions[key].allOf) {
            swagger.definitions[key].allOf.forEach(element => {
                if (element.$ref && element.$ref === referenceName) {
                    inheritsObject[key] = ajv.compile(dereferencedDefinitions[key]);
                    inheritsObject.inheritance.push(key);
                }
            });
        }
    }, this);

    return new Validators.OneOfValidator(inheritsObject);
}
