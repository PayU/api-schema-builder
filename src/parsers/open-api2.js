
const Validators = require('../validators'),
    Ajv = require('ajv'),
    ajvUtils = require('../utils/ajv-utils');

module.exports = {
    getValidatedBodySchema,
    buildBodyValidation
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

function buildBodyValidation(schema, swaggerDefinitions, originalSwagger, currentPath, currentMethod, parsedPath, middlewareOptions = {}, schemaReference) {
    let ajv = new Ajv({allErrors: true, ...middlewareOptions.ajvConfigBody});
    ajvUtils.addCustomKeyword(ajv, middlewareOptions.formats, middlewareOptions.keywords);

    if (schema.discriminator) {
        return buildInheritance(schema.discriminator, swaggerDefinitions, originalSwagger, currentPath, currentMethod, parsedPath, ajv, schemaReference);
    } else {
        return new Validators.SimpleValidator(ajv.compile(schema));
    }
}
function buildInheritance(discriminator, dereferencedDefinitions, swagger, currentPath, currentMethod, parsedPath, ajv, schemaReference) {
    var inheritsObject = {
        inheritance: []
    };
    inheritsObject.discriminator = discriminator;

    Object.keys(swagger.definitions).forEach(key => {
        if (swagger.definitions[key].allOf) {
            swagger.definitions[key].allOf.forEach(element => {
                if (element['$ref'] && element['$ref'] === schemaReference) {
                    inheritsObject[key] = ajv.compile(dereferencedDefinitions[key]);
                    inheritsObject.inheritance.push(key);
                }
            });
        }
    }, this);

    return new Validators.OneOfValidator(inheritsObject);
}
