
const filesKeyword = require('../customKeywords/files'),
    contentKeyword = require('../customKeywords/contentTypeValidation');

function addCustomKeyword(ajv, formats, keywords) {
    formats.forEach(function (format) {
        ajv.addFormat(format.name, format.pattern);
    });

    if (keywords) {
        keywords.forEach((keyword) => {
            if (typeof keyword === 'function') {
                return keyword(ajv);
            }

            if (typeof keyword === 'object') {
                return ajv.addKeyword(keyword);
            }
        });
    }

    ajv.addKeyword(filesKeyword);
    ajv.addKeyword(contentKeyword);
}

module.exports = {
    addCustomKeyword
};
