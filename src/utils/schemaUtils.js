const values = require('object.values');
if (!Object.values) {
    values.shim();
}

const DEFAULT_REQUEST_CONTENT_TYPE = 'application/json';
const DEFAULT_RESPONSE_CONTENT_TYPE = 'application/json';

function getAllResponseContentTypes(responses) {
    if (!responses || responses.length === 0) {
        return [DEFAULT_RESPONSE_CONTENT_TYPE];
    }

    const resultSet = Object.values(responses).reduce((result, response) => {
        if (!response.content) {
            result.add(DEFAULT_RESPONSE_CONTENT_TYPE);
            return result;
        }
        Object.keys(response.content).forEach((contentType) => {
            result.add(contentType);
        });
        return result;
    }, new Set());

    return Array.from(resultSet);
}

/**
 * recursively omit prop with the given name and if it equals to the given value
 *
 * @param {object} dereferencedSchema dereferenced schema
 * @param {string} omitByPropName the prop name to omit
 * @param {string} omitByValue omit if the prop value equals to this value
 */
function omitPropsFromSchema(dereferencedSchema, omitByPropName, omitByValue) {
    if (dereferencedSchema.type === 'object') {
        const newSchema = Object.assign({}, dereferencedSchema);
        const schemaProperties = dereferencedSchema.properties;
        const newSchemaProperties = Object.assign({}, schemaProperties);
        for (const propName of Object.keys(newSchemaProperties)) {
            if (newSchemaProperties[propName][omitByPropName] === omitByValue) {
                // delete the prop from properties object so it would be accepted in case of additionalProperties: true
                delete newSchemaProperties[propName];

                // delete the prop from the required props
                const index = newSchema.required ? newSchema.required.indexOf(propName) : -1;
                if (index >= 0) {
                    newSchema.required = newSchema.required.slice(0, index)
                        .concat(newSchema.required.slice(index + 1));
                }
            } else if (newSchemaProperties[propName].type === 'object') {
                // if the current prop is an object we need to recursively look for omitByPropName occurrences
                newSchemaProperties[propName] = omitPropsFromSchema(newSchemaProperties[propName], omitByPropName, omitByValue);
            }
        }
        newSchema.properties = newSchemaProperties;
        return newSchema;
    } else if (dereferencedSchema.type === 'array' && dereferencedSchema.items.type === 'object') {
        const newSchema = Object.assign({}, dereferencedSchema);
        newSchema.items = omitPropsFromSchema(dereferencedSchema.items, omitByPropName, omitByValue);
        return newSchema;
    } else {
        return dereferencedSchema;
    }
}

function isOpenApi3(dereferenced) {
    return dereferenced.openapi ? dereferenced.openapi.startsWith('3.') : false;
}

module.exports = {
    DEFAULT_RESPONSE_CONTENT_TYPE,
    DEFAULT_REQUEST_CONTENT_TYPE,
    getAllResponseContentTypes,
    omitPropsFromSchema,
    isOpenApi3
};
