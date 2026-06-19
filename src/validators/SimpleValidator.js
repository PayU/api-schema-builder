
const Validator = require('./Validator');
const { normalizeAjvErrors } = require('./validator-utils');

class SimpleValidator extends Validator {
    constructor(schema) {
        super(simple, schema);
    }
}

function simple(ajvValidate, data) {
    const result = ajvValidate(data);
    this.errors = normalizeAjvErrors(ajvValidate.errors);

    return result;
}

module.exports = SimpleValidator;