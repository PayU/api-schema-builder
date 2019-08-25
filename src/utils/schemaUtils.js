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
function addOAI3Support(dereferencedSchema, omitByPropName, omitByValue) {
    const schemaType = getSchemaType(dereferencedSchema);

    addNullableSupport(dereferencedSchema);

    if (schemaType) {
        // anyOf/oneOf/allOf handling
        const newSchema = Object.assign({}, dereferencedSchema);
        newSchema[schemaType] = dereferencedSchema[schemaType]
            .map((dereferencedSchema) => addOAI3Support(dereferencedSchema, omitByPropName, omitByValue));
        return newSchema;
    } else if (dereferencedSchema.properties) {
        // object handling
        const newSchema = Object.assign({}, dereferencedSchema);
        const schemaProperties = Object.assign({}, dereferencedSchema.properties);
        for (const propName of Object.keys(schemaProperties)) {
            addRWOnlySupport(schemaProperties, propName, omitByPropName, omitByValue);
            addNullableSupport(schemaProperties[propName]);
        }
        newSchema.properties = schemaProperties;
        return newSchema;
    } else if (dereferencedSchema.items && dereferencedSchema.items.properties) {
        // array handling
        const newSchema = Object.assign({}, dereferencedSchema);
        const newItems = Object.assign({}, dereferencedSchema.items);

        newSchema.items = addOAI3Support(newItems, omitByPropName, omitByValue);
        return newSchema;
    } else {
        // other datatypes handling
        return dereferencedSchema;
    }
}

/**
 * add missing readOnly/writeOnly support to AJV
 *
 * @param {object} dereferencedSchema dereferenced schema
 * @param {string} omitByPropName the prop name to omit
 * @param {string} omitByValue omit if the prop value equals to this value
 */
function addRWOnlySupport(dereferencedSchema, propName, omitByPropName, omitByValue) {
    if (dereferencedSchema[propName][omitByPropName] === omitByValue) {
        // delete the prop from properties object so it would be accepted in case of additionalProperties: true
        delete dereferencedSchema[propName];

        // delete the prop from the required props
        const propIndex = dereferencedSchema.required ? dereferencedSchema.required.indexOf(propName) : -1;
        if (propIndex >= 0) {
            dereferencedSchema.required = dereferencedSchema.required.slice(0, propIndex)
                .concat(dereferencedSchema.required.slice(propIndex + 1));
        }
    } else if (dereferencedSchema[propName].properties) {
        // if the current prop is an object we need to recursively look for omitByPropName occurrences
        dereferencedSchema[propName] = addOAI3Support(dereferencedSchema[propName], omitByPropName, omitByValue);
    }
}

/**
 * add missing nullable support to AJV
 *
 * @param {object} dereferencedSchema dereferenced schema
 */
function addNullableSupport(dereferencedSchema) {
    if (dereferencedSchema && dereferencedSchema.nullable === true && !dereferencedSchema.type.includes('null')) {
        dereferencedSchema.type = ['null'].concat(dereferencedSchema.type);
    }
}

/**
 * returns true if given dereferenced schema object is an openapi version 3.x.x
 *
 * @param {object} dereferencedSchema
 */
function isOpenApi3(dereferencedSchema) {
    return dereferencedSchema.openapi ? dereferencedSchema.openapi.startsWith('3.') : false;
}

/**
 * returns the type of the given dereferenced schema object (anyOf, oneOf, allOf)
 *
 * @param {object} dereferencedSchema
 */
function getSchemaType(dereferencedSchema) {
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
    addOAI3Support,
    getSchemaType,
    isOpenApi3
};
