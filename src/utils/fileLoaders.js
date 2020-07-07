const fs = require('fs');
const path = require('path');
const jsyaml = require('js-yaml');

const cwd = process.cwd();

const file = (refValue, options) => {
    let refPath = refValue;
    const baseFolder = options.baseFolder ? path.resolve(cwd, options.baseFolder) : cwd;

    if (refPath.indexOf('file:') === 0) {
        refPath = refPath.substring(5);
    } else {
        refPath = path.resolve(baseFolder, refPath);
    }

    const filePath = getRefFilePath(refPath);
    const filePathLowerCase = filePath.toLowerCase();

    const data = fs.readFileSync(filePath, 'utf8');
    if (filePathLowerCase.endsWith('.json')) {
        return JSON.parse(data);
    } else if (filePathLowerCase.endsWith('.yml') || filePathLowerCase.endsWith('.yaml')) {
        return jsyaml.load(data);
    }
};

function getRefFilePath(refPath) {
    const hashIndex = refPath.indexOf('#');
    if (hashIndex > 0) {
        return refPath.substring(0, hashIndex);
    } else {
        return refPath;
    }
}

module.exports = { file };