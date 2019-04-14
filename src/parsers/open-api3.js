const Validators = require('../validators/index'),
    Ajv = require('ajv'),
    cloneDeep = require('clone-deep'),
    ajvUtils = require('../utils/ajv-utils'),
    { Node } = require('../data_structures/tree'),
    createContentTypeHeaders = require('../utils/createContentTypeHeaders'),
    get = require('lodash.get');

const OAI3_RESPONSE_CONTENT_TYPE = 'application/json';

module.exports = {
    buildRequestBodyValidation,
    buildResponseBodyValidation,
    buildHeadersValidation,
    buildPathParameters
};

function buildRequestBodyValidation(dereferenced, referenced, currentPath, currentMethod, options) {
    const requestPath = `paths[${currentPath}][${currentMethod}].requestBody.content[${OAI3_RESPONSE_CONTENT_TYPE}].schema`;
    let dereferencedBodySchema = get(dereferenced, requestPath);
    let referencedBodySchema = get(referenced, requestPath);

    return handleBodyValidation(dereferenced, referenced, currentPath, currentMethod,
        dereferencedBodySchema, referencedBodySchema, options);
}

function buildResponseBodyValidation(dereferenced, referenced, currentPath, currentMethod, statusCode, options) {
    const responsePath = `paths[${currentPath}][${currentMethod}].responses[${statusCode}].content[${OAI3_RESPONSE_CONTENT_TYPE}].schema`;

    let dereferencedBodySchema = get(dereferenced, responsePath);
    let referencedBodySchema = get(referenced, responsePath);

    return handleBodyValidation(dereferenced, referenced, currentPath, currentMethod,
        dereferencedBodySchema, referencedBodySchema, options);
}

function handleBodyValidation(dereferenced, referenced, currentPath, currentMethod,
    dereferencedBodySchema, referencedBodySchema, { ajvConfigBody, formats, keywords }){
    if (!dereferencedBodySchema || !referencedBodySchema) return;

    const defaultAjvOptions = {
        allErrors: true
    };

    const ajvOptions = Object.assign({}, defaultAjvOptions, ajvConfigBody);
    let ajv = new Ajv(ajvOptions);

    ajvUtils.addCustomKeyword(ajv, formats, keywords);

    if (dereferencedBodySchema.discriminator) {
        let referencedSchemas = referenced.components.schemas;
        let dereferencedSchemas = dereferenced.components.schemas;
        let referenceName = referencedBodySchema['$ref'];

        return buildV3Inheritance(referencedSchemas, dereferencedSchemas, currentPath, currentMethod, ajv, referenceName);
    } else {
        return new Validators.SimpleValidator(ajv.compile(dereferencedBodySchema));
    }
}

function buildPathParameters(parameters, pathParameters) {
    let allParameters = [].concat(parameters, pathParameters);
    let localParameters = allParameters.map(handleSchema);
    return localParameters;
}

function handleSchema(data) {
    let clonedData = cloneDeep(data);
    let schema = data.schema;
    if (schema) {
        delete clonedData['schema'];
        Object.assign(clonedData, schema);
    }
    return clonedData;
}

function buildHeadersValidation(responses, statusCode, { ajvConfigParams, formats, keywords, contentTypeValidation }) {
    let headers = get(responses, `[${statusCode}].headers`);
    if (!headers) return;

    const defaultAjvOptions = {
        allErrors: true,
        coerceTypes: 'array'
    };
    const ajvOptions = Object.assign({}, defaultAjvOptions, ajvConfigParams);
    let ajv = new Ajv(ajvOptions);

    ajvUtils.addCustomKeyword(ajv, formats, keywords);

    var ajvHeadersSchema = {
        title: 'HTTP headers',
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: true
    };

    Object.keys(headers).forEach(key => {
        let headerObj = Object.assign({}, headers[key].schema);
        const headerName = key.toLowerCase();
        delete headerObj.name;
        delete headerObj.required;
        ajvHeadersSchema.properties[headerName] = headerObj;
    });

    ajvHeadersSchema.content = createContentTypeHeaders(contentTypeValidation, OAI3_RESPONSE_CONTENT_TYPE);

    return new Validators.SimpleValidator(ajv.compile(ajvHeadersSchema));
}

function buildV3Inheritance(referencedSchemas, dereferencedSchemas, currentPath, currentMethod, ajv, referenceName) {
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
            let option = findKey(currentSchema.discriminator.mapping, (value) => (value === refObject['$ref']));
            const ref = getKeyFromRef(refObject['$ref']);
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
