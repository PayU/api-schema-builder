
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
                const name = keyword.name;
                const definition = keyword.definition;
                if (name && definition) {
                    return ajv.addKeyword({ keyword: name, ...definition });
                }
            }
        });
    }

    ajv.addKeyword({ keyword: 'files', ...filesKeyword });
    ajv.addKeyword({ keyword: 'content', ...contentKeyword });
}

module.exports = {
    addCustomKeyword
};
