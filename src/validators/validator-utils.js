
module.exports = {
    allowedValuesError
};

function allowedValuesError(discriminator, allowedValues) {
    const error = new Error('must be equal to one of the allowed values');
    error.instancePath = '/' + discriminator;
    error.keyword = 'enum';
    error.params = {
        allowedValues: allowedValues
    };
    error.schemaPath = '#/properties/' + discriminator;
    this.errors = [error];
}
