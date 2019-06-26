const DEFAULT_RESPONSE_CONTENT_TYPE = 'application/json';

function getAllResponseContentTypes(responses) {
    if (!responses) {
        return new Set();
    }

    return Object.values(responses).reduce((result, response) => {
        if (!result.content) {
            result.add(DEFAULT_RESPONSE_CONTENT_TYPE);
            return result;
        }
        Object.keys(result.content).forEach((contentType) => {
            result.add(contentType);
        });
        return result;
    }, new Set());
}

module.exports = {
    getAllResponseContentTypes
};
