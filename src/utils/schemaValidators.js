const OpenAPISchemaValidator = require('openapi-schema-validator').default;

let validator;

function getOAI3Validator() {
    if (!validator) {
        validator = new OpenAPISchemaValidator({
            version: 3,
            version3Extensions: {
            }
        });
    }

    return validator;
}

module.exports = {
    getOAI3Validator
};
