
module.exports = {
    allowedValuesError,
    normalizeAjvErrors
};

function allowedValuesError(discriminator, allowedValues) {
    const error = new Error('must be equal to one of the allowed values');
    error.dataPath = '.' + discriminator;
    error.keyword = 'enum';
    error.params = {
        allowedValues: allowedValues
    };
    error.schemaPath = '#/properties/' + discriminator;
    this.errors = [error];
}

function normalizeAjvErrors(errors) {
    if (!errors) return errors;
    errors.forEach(error => {
        // Ajv v8 uses instancePath (JSON Pointer) instead of dataPath (dot notation)
        if (error.instancePath !== undefined && error.dataPath === undefined) {
            error.dataPath = instancePathToDataPath(error.instancePath);
            delete error.instancePath;
        }
    });
    return errors;
}

function instancePathToDataPath(instancePath) {
    if (!instancePath) return '';
    return instancePath.split('/').filter(Boolean).map(segment => {
        segment = segment.replace(/~1/g, '/').replace(/~0/g, '~');
        // Numeric segments are array indices
        if (/^\d+$/.test(segment)) {
            return '[' + segment + ']';
        }
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(segment)) {
            return '.' + segment;
        }
        return "['" + segment + "']";
    }).join('');
}
