let schemaValidatorGenerator = require('../../../src/index');
let InputValidationError = require('../../inputValidationError');
let _ =require('lodash');
var FormData = require('form-data');

class Tester {
    constructor(schemas, options){
        this.schemas = schemas
        this.queries =  {};
        this.headers = {};
        this.path= {};
        this.files= [];
        this.pathParams = {}
        this.options = options;
        this.body = {}
    }
    query(queries){
        this.queries = queries
        return this;
    }
    get(pathName){
      this.methd = 'get';
      extractFromPath(pathName, this)
      return this;
    }
    put(pathName){
        this.methd = 'put';
        extractFromPath(pathName, this)
        return this;
    }
    delete(pathName){
        this.methd = 'delete';
        extractFromPath(pathName, this)
        return this;
    }
    patch(pathName){
        this.methd = 'patch';
        extractFromPath(pathName, this)
        return this;
    }
    post(pathName){
        this.methd = 'post';
        extractFromPath(pathName, this)
        return this;
    }
    set(headerName, headerValue){
        if(headerName == 'content-type'){
            this.headers['content-length'] = 1

        }

      this.headers[headerName] = headerValue
        return this;
    }
    send(body){
        this.body = body;
        return this;
    }
    expect(_, callback){
        if(callback){
           return handleCallback(this, callback);
        }
        else{
            return this;
        }

    }
    end(callback){
        return handleCallback(this, callback);
    }
    attach(fieldName, originalName) {
        this.files.push({'fieldname': fieldName });
        return this;
    }

    field(fieldName, fieldValue){
        this.body[fieldName] = fieldValue;
        return this;
    }
}

module.exports = Tester



let handleCallback = function(tester, callback){
    let response;
    return validateRequest({
            query:tester.queries,
            body:tester.body,
            headers:tester.headers,
            params:tester.pathParams,
            files:tester.files,
            method: tester.methd,
            path: tester.path
        },
        tester.schemas)
        .then(() => {
            response = {body:{ result: 'OK', receivedParams: tester.body }};
        })
        .catch(errors => {
            const error = new InputValidationError(errors,
                { beautifyErrors: tester.options.beautifyErrors,
                    firstError: tester.options.firstError });
            //response = {body:{ more_info: JSON.stringify(error.errors) }};
            response = {body:{ more_info: JSON.stringify(error.errors) }};

        })
        .finally(() => {
            callback(undefined, response)
        })
}
let extractFromPath = function(pathName, tester){
    pathObj = pathMatcher(tester.schemas,pathName)
    tester.path = pathObj.path;
    tester.pathParams = pathObj.pathParams;
    //Object.assign(this.pathNames, getRelevantPathName(pathName))
}

function getSchemaByPathMethodAndCode(schema, requestPath, requestMethod) {
    const path = pathMatcher(schema, requestPath);

    return _.chain(schema)
        .get('properties.paths')
        .get(`properties[${path}]`)
        .get(`properties[${requestMethod}]`)
        .value();
}

//todo - to build it under schemaEndpoint it required more changes
function validateRequest(requestOptions, schemas) {
    return Promise.all([
        _validateParams(schemas, requestOptions.headers, requestOptions.params, requestOptions.query, requestOptions.files, requestOptions.path, requestOptions.method.toLowerCase()).catch(e => e),
        _validateBody(schemas, requestOptions.body, requestOptions.path, requestOptions.method.toLowerCase()).catch(e => e)
    ]).then(function (errors) {
        if (errors[0] || errors[1]) {
            return errors[0] && errors[1] ? Promise.reject(errors[0].concat(errors[1])) : errors[0] ? Promise.reject(errors[0]) : Promise.reject(errors[1]);
        }
    })
}

function _validateBody(schemas, body, path, method) {
    return new Promise(function (resolve, reject) {
        if (schemas[path] && schemas[path][method] && schemas[path][method].body && !schemas[path][method].body.validate(body)) {
            return reject(schemas[path][method].body.errors);
        }
        return resolve();
    });
}

function _validateParams(schemas, headers, pathParams, query, files, path, method) {
    return new Promise(function (resolve, reject) {
        if (schemas[path] && schemas[path][method] && schemas[path][method].parameters && !schemas[path][method].parameters.validate({ query: query, headers: headers, path: pathParams, files: files })) {
            return reject(schemas[path][method].parameters.errors);
        }

        return resolve();
    });
}


function pathMatcher(schema, path) {
    if (schema) {
        return Object.keys(schema).reduce((prev, schemaPath) => {
            //const path = '/v2/pets/123/names/333'

            const pattern = schemaPath.replace(/:(\w+)/g, '(?<$1>[^/]+)')
            //for many replaces
           // const matcher = schemaPath.split(/\:[^/]+/).join('[^/]+');
            if (path.match(`^${pattern}/?$`)) {
                const re = new RegExp(pattern)
                const res = re.exec(path)
                return {
                    path: schemaPath,
                    pathParams: res.groups
                };
            }
            return prev;
        }, undefined);
    }

    return undefined;
}
