const OpenAPISchemaValidator = require('openapi-schema-validator').default;
const openApi3Validator = new OpenAPISchemaValidator({
    version: 3,
    version3Extensions: {
    }
});

module.exports = {
    openApi3Validator
};
