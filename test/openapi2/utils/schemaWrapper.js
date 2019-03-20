function validateBody({ schemas, body, path, method }) {
    if (schemas[path] && schemas[path][method] && schemas[path][method].body && !schemas[path][method].body.validate(body)) {
        return schemas[path][method].body.errors;
    }
}

function validateParams({ schemas, headers, pathParams, query, files, path, method }) {
    if (schemas[path] && schemas[path][method] && schemas[path][method].parameters && !schemas[path][method].parameters.validate({ query: query, headers: headers, path: pathParams, files: files })) {
        return schemas[path][method].parameters.errors;
    }
}

module.exports = {
    validateBody: validateBody,
    validateParams: validateParams
};
