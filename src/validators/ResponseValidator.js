
const Validator = require('./Validator');
const DEFAULT_CONTENT_TYPE = 'application/json';

class ResponseValidator extends Validator {
    constructor(schema) {
        super(responseValidator, schema);
    }
}
function responseValidator(response, data) {
    let bodySchema = response.body;
    let headersSchema = response.headers;
    let bodyValidationResult = true, bodyValidationErrors = [],
        headersValidationResult = true, headersValidationErrors = [];
    if (bodySchema) {
        const validator = bodySchema.validate ? bodySchema
            : bodySchema[data.headers['Content-Type'] || DEFAULT_CONTENT_TYPE];
        bodyValidationResult = validator.validate(data.body);
        bodyValidationErrors = validator.errors ? addErrorPrefix(validator.errors, 'body') : [];
    }
    if (headersSchema) {
        headersValidationResult = headersSchema.validate(data.headers);
        headersValidationErrors = headersSchema.errors ? addErrorPrefix(headersSchema.errors, 'headers') : [];
    }

    let errors = bodyValidationErrors.concat(headersValidationErrors);
    this.errors = errors.length === 0 ? null : errors;

    return bodyValidationResult && headersValidationResult;
}

function addErrorPrefix(errors, prefix) {
    errors.forEach(error => {
        error.dataPath = '.' + prefix + error.dataPath;
        error.schemaPath = error.schemaPath.replace('#', '#/' + prefix);
    });
    return errors;
}
module.exports = ResponseValidator;
