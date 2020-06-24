
const getOAI3Validator = (() => {
    const OpenAPISchemaValidator = require('openapi-schema-validator').default;

    let validator;
    return () => {
        if (!validator) {
            validator = new OpenAPISchemaValidator({
                version: 3,
                version3Extensions: {
                }
            });
        }

        return validator;
    };
})();

module.exports = {
    getOAI3Validator
};
