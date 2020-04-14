
const Validator = require('./Validator');
const DEFAULT_CONTENT_TYPE = 'application/json';

class ResponseValidator extends Validator {
    constructor(schema) {
        super(responseValidator, schema);
    }
}
function responseValidator(response, data) {
    const bodySchema = response.body;
    const headersSchema = response.headers;
    let bodyValidationResult = true, bodyValidationErrors = [],
        headersValidationResult = true, headersValidationErrors = [];
    if (bodySchema) {
        let validator;
        if (bodySchema.validate) {
            validator = bodySchema;
        } else {
            const responseContentTypeHeader = data.headers['Content-Type'] || data.headers['content-type'] || DEFAULT_CONTENT_TYPE;
            const responseContentType = responseContentTypeHeader.split(';')[0].trim(); // This is to filter out things like charset
            validator = bodySchema[responseContentType];
            if (!validator) {
                this.errors = [{ message: `No schema defined for response content-type "${responseContentType}"` }
                ];
                return false;
            }
        }

        bodyValidationResult = validator.validate(data.body);
        bodyValidationErrors = validator.errors ? addErrorPrefix(validator.errors, 'body') : [];
    }
    if (headersSchema) {
        headersValidationResult = headersSchema.validate(data.headers);
        headersValidationErrors = headersSchema.errors ? addErrorPrefix(headersSchema.errors, 'headers') : [];
    }

    const errors = bodyValidationErrors.concat(headersValidationErrors);
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
