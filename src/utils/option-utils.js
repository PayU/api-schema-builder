function createContentTypeHeaders(validate, contentTypes) {
    if (!validate || !contentTypes) return;

    return {
        types: contentTypes
    };
}

module.exports = {
    createContentTypeHeaders: createContentTypeHeaders
};
