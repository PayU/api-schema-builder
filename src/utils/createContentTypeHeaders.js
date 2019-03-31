module.exports = function (validate, contentTypes) {
    if (!validate || !contentTypes) return;

    return {
        types: contentTypes
    };
};
