const path = require('path');
const fs = require('fs');

const { getOAIVersion } = require('./schemaUtils');

async function loadSchemaAsync(swaggerPath) {
    const SwaggerParser = require('swagger-parser');

    const [dereferencedSchema, jsonSchema] = await Promise.all([
        SwaggerParser.dereference(swaggerPath),
        SwaggerParser.parse(swaggerPath)
    ]);

    return { dereferencedSchema, jsonSchema };
}

function loadSchema(pathOrSchema, options) {
    const schemaValidators = require('./schemaValidators');

    const jsonSchema = getJsonSchema(pathOrSchema);
    const basePath = getSchemaBasePath(pathOrSchema, options);
    const dereferencedSchema = dereference(basePath, jsonSchema);

    if (getOAIVersion(dereferencedSchema) === 3) {
        const validationResult = schemaValidators.getOAI3Validator().validate(dereferencedSchema);
        if (validationResult.errors && validationResult.errors.length > 0) {
            const error = new Error('Invalid OpenAPI 3 schema');
            error.errors = validationResult.errors;
            throw error;
        }
    }

    return { jsonSchema, dereferencedSchema };
}

function dereference(basePath, jsonSchema) {
    const deref = require('json-schema-deref-sync');
    const schemaLoaders = require('./fileLoaders');

    const dereferencedSchema = deref(jsonSchema, {
        baseFolder: basePath,
        failOnMissing: true,
        loaders: schemaLoaders
    });

    return dereferencedSchema;
}

function getJsonSchema(pathOrSchema) {
    if (typeof pathOrSchema === 'string') {
        // file path
        const yaml = require('js-yaml');

        const fileContents = fs.readFileSync(pathOrSchema);
        const jsonSchema = yaml.load(fileContents, 'utf8');
        return jsonSchema;
    } else {
        // json schema
        return pathOrSchema;
    }
}

function getSchemaBasePath(pathOrSchema, options = {}) {
    // always return basePath from options if exists
    if (options.basePath) {
        return options.basePath;
    }

    // in case a path to definitions file was given
    if (typeof pathOrSchema === 'string') {
        const fullPath = path.resolve(pathOrSchema).split(path.sep);
        fullPath.pop();
        return fullPath.join(path.sep);
    }
}

module.exports = { loadSchema, loadSchemaAsync };