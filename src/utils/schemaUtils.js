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
    const combinedSchemaType = getCombinedSchemaType(dereferencedSchema);

    if (combinedSchemaType) {
        const newSchema = Object.assign({}, dereferencedSchema);
        newSchema[combinedSchemaType] = dereferencedSchema[combinedSchemaType]
            .map((dereferencedSchema) => omitPropsFromSchema(dereferencedSchema, omitByPropName, omitByValue));
        return newSchema;
    } else if (dereferencedSchema.type === 'object') {
        const newSchema = Object.assign({}, dereferencedSchema);
        const schemaProperties = Object.assign({}, dereferencedSchema.properties);
        for (const propName of Object.keys(schemaProperties)) {
            if (schemaProperties[propName][omitByPropName] === omitByValue) {
                // delete the prop from properties object so it would be accepted in case of additionalProperties: true
                delete schemaProperties[propName];

                // delete the prop from the required props
                const propIndex = newSchema.required ? newSchema.required.indexOf(propName) : -1;
                if (propIndex >= 0) {
                    newSchema.required = newSchema.required.slice(0, propIndex)
                        .concat(newSchema.required.slice(propIndex + 1));
                }
            } else if (schemaProperties[propName].type === 'object') {
                // if the current prop is an object we need to recursively look for omitByPropName occurrences
                schemaProperties[propName] = omitPropsFromSchema(schemaProperties[propName], omitByPropName, omitByValue);
            }
        }
        newSchema.properties = schemaProperties;
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

function getCombinedSchemaType(dereferencedSchema) {
    if (dereferencedSchema.anyOf) {
        return 'anyOf';
    }
    if (dereferencedSchema.allOf) {
        return 'allOf';
    }
    if (dereferencedSchema.oneOf) {
        return 'oneOf';
    }
}

module.exports = {
    DEFAULT_RESPONSE_CONTENT_TYPE,
    DEFAULT_REQUEST_CONTENT_TYPE,
    getAllResponseContentTypes,
    omitPropsFromSchema,
    isOpenApi3
};
