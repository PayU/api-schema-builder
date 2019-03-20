
const Validators = require('../validators'),
    Ajv = require('ajv'),
    ajvUtils = require('../utils/ajv-utils');

module.exports = {
    getValidatedBodySchema,
    buildResponseBodyValidation,
    buildRequestBodyValidation
};

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

function buildAjvValidator(ajvConfigBody, formats, keywords){
    const defaultAjvOptions = {
        allErrors: true
    };
    const ajvOptions = Object.assign({}, defaultAjvOptions, ajvConfigBody);
    let ajv = new Ajv(ajvOptions);

    ajvUtils.addCustomKeyword(ajv, formats, keywords);
    return ajv;
}

function buildResponseBodyValidation(schema, swaggerDefinitions, originalSwagger, currentPath, currentMethod, options, statusCode) {
    if (!schema){ return }

    let ajv = buildAjvValidator(options.ajvConfigBody, options.formats, options.keywords);

    if (schema.discriminator) {
        let schemaReference = originalSwagger.paths[currentPath][currentMethod].responses[statusCode].schema;
        return buildInheritance(schema.discriminator, swaggerDefinitions, originalSwagger, currentPath, currentMethod, ajv, schemaReference);
    } else {
        return new Validators.SimpleValidator(ajv.compile(schema));
    }
}
function buildRequestBodyValidation(schema, swaggerDefinitions, originalSwagger, currentPath, currentMethod, options) {
    let ajv = buildAjvValidator(options.ajvConfigBody, options.formats, options.keywords);

    if (schema.discriminator) {
        let schemaReference = originalSwagger.paths[currentPath][currentMethod].parameters.filter(function (parameter) { return parameter.in === 'body' })[0].schema;
        return buildInheritance(schema.discriminator, swaggerDefinitions, originalSwagger, currentPath, currentMethod, ajv, schemaReference);
    } else {
        return new Validators.SimpleValidator(ajv.compile(schema));
    }
}

function buildInheritance(discriminator, dereferencedDefinitions, swagger, currentPath, currentMethod, ajv, schemaReference = {}) {
    var inheritsObject = {
        inheritance: []
    };
    inheritsObject.discriminator = discriminator;

    Object.keys(swagger.definitions).forEach(key => {
        if (swagger.definitions[key].allOf) {
            swagger.definitions[key].allOf.forEach(element => {
                if (element['$ref'] && element['$ref'] === schemaReference['$ref']) {
                    inheritsObject[key] = ajv.compile(dereferencedDefinitions[key]);
                    inheritsObject.inheritance.push(key);
                }
            });
        }
    }, this);

    return new Validators.OneOfValidator(inheritsObject);
}
