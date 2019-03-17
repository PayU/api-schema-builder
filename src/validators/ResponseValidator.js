
const Validator = require('./Validator');

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
    if (bodySchema){
       // let bodyToValidate = data.body || {}
        bodyValidationResult = bodySchema.validate(data.body);
        bodyValidationErrors = bodySchema.errors ? addErrorPrefix(bodySchema.errors, 'body') : [];
    }
    if (headersSchema && data.headers){
        headersValidationResult = headersSchema.validate(data.headers);
        headersValidationErrors = headersSchema.errors ? addErrorPrefix(headersSchema.errors, 'headers') : [];
    }

    let errors = bodyValidationErrors.concat(headersValidationErrors);
    this.errors = errors.length === 0 ? null : errors;
    let result = bodyValidationResult && headersValidationResult;

    return result;
}

function addErrorPrefix(errors, prefix){
    errors.forEach(error => {
        error.dataPath = '.' + prefix + error.dataPath;
        error.schemaPath = error.schemaPath.replace('#', '#/' + prefix);
    });
    return errors;
}
module.exports = ResponseValidator;
