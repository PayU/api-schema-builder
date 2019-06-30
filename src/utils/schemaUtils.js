const values = require('object.values');
if (!Object.values) {
    values.shim();
}

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

module.exports = {
    DEFAULT_RESPONSE_CONTENT_TYPE,
    getAllResponseContentTypes
};
