const cloneDeep = require('clone-deep');
const get = require('lodash.get');
const Ajv = require('ajv');

const Validators = require('../validators/index');
const ajvUtils = require('../utils/ajv-utils');
const { Node } = require('../data_structures/tree');
const createContentTypeHeaders = require('../utils/createContentTypeHeaders');
const { validationTypes } = require('../utils/common');
const schemaUtils = require('../utils/schemaUtils');

module.exports = {
    buildRequestBodyValidation,
    buildResponseBodyValidation,
    buildHeadersValidation,
    buildPathParameters
};

function buildRequestBodyValidation(dereferenced, referenced, currentPath, currentMethod, options) {
    const contentTypes = get(dereferenced, `paths[${currentPath}][${currentMethod}].requestBody.content`);
    if (!contentTypes) {
        return;
    }

    // Add default validator for default content type for compatibility sake
    const requestPath = `paths[${currentPath}][${currentMethod}].requestBody.content[${schemaUtils.DEFAULT_REQUEST_CONTENT_TYPE}].schema`;

    const dereferencedBodySchema = get(dereferenced, requestPath);
    const referencedBodySchema = get(referenced, requestPath);

    const result = handleBodyValidation(
        dereferenced, referenced,
        dereferencedBodySchema, referencedBodySchema,
        validationTypes.request,
        options
    ) || {};

    // Add validators for all content types
    const schema = Object.keys(contentTypes).reduce((result, contentType) => {
        const requestPath = `paths[${currentPath}][${currentMethod}].requestBody.content[${contentType}].schema`;

        const dereferencedBodySchema = get(dereferenced, requestPath);
        const referencedBodySchema = get(referenced, requestPath);

        result[contentType] = handleBodyValidation(
            dereferenced, referenced,
            dereferencedBodySchema, referencedBodySchema,
            validationTypes.request,
            options
        );
        return result;
    }, result);

    return schema;
}

function buildResponseBodyValidation(dereferenced, referenced, currentPath, currentMethod, statusCode, options) {
    const contentTypes = get(dereferenced, `paths[${currentPath}][${currentMethod}].responses[${statusCode}].content`);
    if (!contentTypes) {
        return;
    }

    const schema = Object
        .keys(contentTypes)
        .reduce((result, contentType) => {
            const responsePath = `paths[${currentPath}][${currentMethod}].responses[${statusCode}].content[${contentType}].schema`;

            const dereferencedBodySchema = get(dereferenced, responsePath);
            const referencedBodySchema = get(referenced, responsePath);

            result[contentType] = handleBodyValidation(
                dereferenced, referenced,
                dereferencedBodySchema, referencedBodySchema,
                validationTypes.response,
                options
            );
            return result;
        }, {});

    return schema;
}

function handleBodyValidation(
    dereferenced, referenced,
    dereferencedBodySchema, referencedBodySchema,
    validationType,
    { ajvConfigBody, formats, keywords }
) {
    if (!dereferencedBodySchema) {
        return;
    }

    if (dereferencedBodySchema.discriminator && !referencedBodySchema) {
        return;
    }

    const defaultAjvOptions = {
        allErrors: true,
        nullable: true
    };

    const ajvOptions = Object.assign({}, defaultAjvOptions, ajvConfigBody);
    const ajv = new Ajv(ajvOptions);

    ajvUtils.addCustomKeyword(ajv, formats, keywords);

    if (dereferencedBodySchema.discriminator) {
        const referencedSchemas = referenced.components.schemas;
        const dereferencedSchemas = dereferenced.components.schemas;
        const referenceName = referencedBodySchema.$ref;

        return buildV3Inheritance(referencedSchemas, dereferencedSchemas, ajv, referenceName);
    } else {
        // currently these features won't be supported in objects with discriminators
        const newDereferencedBodySchema = schemaUtils.addOAI3Support(dereferencedBodySchema, validationType);

        return new Validators.SimpleValidator(ajv.compile(newDereferencedBodySchema));
    }
}

function buildPathParameters(parameters, pathParameters) {
    const allParameters = [].concat(parameters, pathParameters);
    const localParameters = allParameters.map(handleSchema);
    return localParameters;
}

function handleSchema(data) {
    const clonedData = cloneDeep(data);
    const schema = data.schema;
    if (schema) {
        delete clonedData.schema;
        Object.assign(clonedData, schema);
    }
    return clonedData;
}

function buildHeadersValidation(responses, statusCode, { ajvConfigParams, formats, keywords, contentTypeValidation }) {
    const headers = get(responses, `[${statusCode}].headers`);
    if (!headers) return;

    const defaultAjvOptions = {
        allErrors: true,
        coerceTypes: 'array'
    };
    const ajvOptions = Object.assign({}, defaultAjvOptions, ajvConfigParams);
    const ajv = new Ajv(ajvOptions);

    ajvUtils.addCustomKeyword(ajv, formats, keywords);

    const ajvHeadersSchema = {
        title: 'HTTP headers',
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: true
    };

    Object.keys(headers).forEach(key => {
        const headerObj = Object.assign({}, headers[key].schema);
        const headerName = key.toLowerCase();
        delete headerObj.name;
        delete headerObj.required;
        ajvHeadersSchema.properties[headerName] = headerObj;
    });

    const contentTypes = schemaUtils.getAllResponseContentTypes(responses);
    ajvHeadersSchema.content = createContentTypeHeaders(contentTypeValidation, contentTypes);

    return new Validators.SimpleValidator(ajv.compile(ajvHeadersSchema));
}

function buildV3Inheritance(referencedSchemas, dereferencedSchemas, ajv, referenceName) {
    const RECURSIVE__MAX_DEPTH = 20;
    const rootKey = referenceName.split('/components/schemas/')[1];
    const tree = new Node();
    function getKeyFromRef(ref) {
        return ref.split('/components/schemas/')[1];
    }

    function recursiveDiscriminatorBuilder(ancestor, option, refValue, propertiesAcc = { required: [], properties: {} }, depth = RECURSIVE__MAX_DEPTH) {
        // assume first time is discriminator.
        if (depth === 0) {
            throw new Error(`swagger schema exceed maximum supported depth of ${RECURSIVE__MAX_DEPTH} for swagger definitions inheritance`);
        }
        const discriminator = dereferencedSchemas[refValue].discriminator,
            currentSchema = referencedSchemas[refValue],
            currentDereferencedSchema = dereferencedSchemas[refValue];

        if (!discriminator) {
            // need to stop and just add validator on ancesstor;
            const newSchema = cloneDeep(currentDereferencedSchema);
            newSchema.required = newSchema.required || [];
            newSchema.required.push(...(propertiesAcc.required || []));
            newSchema.properties = Object.assign(newSchema.properties, propertiesAcc.properties);
            ancestor.getValue().validators[option] = ajv.compile(newSchema); // think about key
            return;
        }
        propertiesAcc = cloneDeep(propertiesAcc);
        propertiesAcc.required.push(...(currentDereferencedSchema.required || []));
        propertiesAcc.properties = Object.assign(propertiesAcc.properties, currentDereferencedSchema.properties);

        const discriminatorObject = { validators: {} };
        discriminatorObject.discriminator = discriminator.propertyName;

        const currentDiscriminatorNode = new Node(discriminatorObject);
        if (!ancestor.getValue()) {
            ancestor.setData(currentDiscriminatorNode);
        } else {
            ancestor.addChild(currentDiscriminatorNode, option);
        }

        if (!currentSchema.oneOf) {
            throw new Error('oneOf must be part of discriminator');
        }

        const options = currentSchema.oneOf.map((refObject) => {
            const option = findKey(currentSchema.discriminator.mapping, (value) => (value === refObject.$ref));
            const ref = getKeyFromRef(refObject.$ref);
            return { option: option || ref, ref };
        });
        discriminatorObject.allowedValues = options.map((option) => option.option);
        options.forEach(function (optionObject) {
            recursiveDiscriminatorBuilder(currentDiscriminatorNode, optionObject.option, optionObject.ref, propertiesAcc, depth - 1);
        });
    }
    recursiveDiscriminatorBuilder(tree, rootKey, rootKey);
    return new Validators.DiscriminatorValidator(tree);
}

function findKey(object, searchFunc) {
    if (!object) {
        return;
    }
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        if (searchFunc(object[keys[i]])) {
            return keys[i];
        }
    }
}
