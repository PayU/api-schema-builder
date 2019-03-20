
# api-schema-builder
[![Build Status](https://travis-ci.org/Zooz/api-schema-builder.svg?branch=master)](https://travis-ci.org/Zooz/api-schema-builder)
[![Coverage Status](https://coveralls.io/repos/github/Zooz/api-schema-builder/badge.svg?branch=master)](https://coveralls.io/github/Zooz/api-schema-builder?branch=master)

This package is used to build schema for input validation base on openapi doc [Swagger (Open API)](https://swagger.io/specification/) definition and [ajv](https://www.npmjs.com/package/ajv)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  <!-- *generated with [DocToc](https://github.com/thlorenz/doctoc)* -->



- [Install](#install)
- [API](#api)
  - [How to use](#how-to-use)
  - [api-schema-builder.buildSchema(PathToSwaggerFile, options)](#express-ajv-swagger-validationgetSchemapathtoswaggerfile-options)
    - [Arguments](#arguments)
      - [Options](#options)
    - [Response](#response)
- [Usage Example](#usage-example)
- [Important Notes](#important-notes)
- [Open api 3 - known issues](#open-api-3---known-issues)
- [Running Tests](#running-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install
```bash
npm install --save api-schema-builder
```

## API

### How to use

```js
var apiSchemaBuilder = require('api-schema-builder');
```

### api-schema-builder.buildSchema(PathToSwaggerFile, options)

Build schema that contains ajv validators for each endpoint, it base on swagger definition.

The function return Promise.

#### Arguments

* `PathToSwaggerFile` &ndash; Path to the swagger definition
* `options` &ndash; Additional options for build the schema.

#### Response
Array that contains:
* `path_name`: the paths it written in the api doc, for example `/pet`.
    * `method`: the relevant method it written in the api doc, for example `get`.
        * `parameters`:
            * `validate`:  ajv validator that check: paths, files, queries and headers.
            * `errors`: in case of fail validation it return array of errors, otherwise return null
        * `body`:
            * `validate`: ajv validator that check: body only.
            * `errors`: in case of fail validation it return array of errors, otherwise return null


##### Options

Options currently supports:.
- `formats` - Array of formats that can be added to `ajv` configuration, each element in the array should include `name` and `pattern`.
- `keywords` - Array of keywords that can be added to `ajv` configuration, each element in the array can be either an object or a function. 
If the element is an object, it must include `name` and `definition`. If the element is a function, it should accept `ajv` as its first argument and inside the function you need to call `ajv.addKeyword` to add your custom keyword 
- `makeOptionalAttributesNullable` - Boolean that forces preprocessing of Swagger schema to include 'null' as possible type for all non-required properties. Main use-case for this is to ensure correct handling of null values when Ajv type coercion is enabled
- `ajvConfigBody` - Object that will be passed as config to new Ajv instance which will be used for validating request body. Can be useful to e. g. enable type coercion (to automatically convert strings to numbers etc). See Ajv documentation for supported values.
- `ajvConfigParams` - Object that will be passed as config to new Ajv instance which will be used for validating request body. See Ajv documentation for supported values.
- `contentTypeValidation` - Boolean that indicates if to perform content type validation in case `consume` field is specified and the request body is not empty.
- `expectFormFieldsInBody` - Boolean that indicates whether form fields of non-file type that are specified in the schema should be validated against request body (e. g. Multer is copying text form fields to body)

```js
formats: [
    { name: 'double', pattern: /\d+\.(\d+)+/ },
    { name: 'int64', pattern: /^\d{1,19}$/ },
    { name: 'int32', pattern: /^\d{1,10}$/ }
]
```

## Usage Example
```js
apiSchemaBuilder.getSchema('test/unit-tests/input-validation/pet-store-swagger.yaml')
.then(function (schema) {
    let schemaEndpoint = schema['/pet']['post'];
    
    //validate parameters
    let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
    headers: { 'public-key': '1.0'},path: {},files: undefined });
    expect(schemaEndpoint.parameters.errors).to.be.equal(null);
    expect(isParametersMatch).to.be.true;
    
    //validate body
    let isBodysMatch =schemaEndpoint.body.validate({'bark': 111});
    expect(schemaEndpoint.body.errors).to.be.eql([{
            'dataPath': '.bark',
            'keyword': 'type',
            'message': 'should be string',
            'params': {
                'type': 'string'
            },
            'schemaPath': '#/properties/bark/type'}
    ])
});
expect(isBodysMatch).to.be.false;
```

## Important Notes

- Objects - it is important to set any objects with the property `type: object` inside your swagger file, although it isn't a must in the Swagger (OpenAPI) spec in order to validate it accurately with [ajv](https://www.npmjs.com/package/ajv) it must be marked as `object`

## Open api 3 - known issues
- supporting inheritance with discriminator , only if the ancestor object is the discriminator.
- The discriminator supports in the inheritance chain stop when getting to a child with no discriminator (a leaf in the inheritance tree), meaning a leaf can't have a field which starts a new inheritance tree.
  so child with no discriminator cant point to other child with discriminator,

## Running Tests
Using mocha and istanbul
```bash
npm run test
```

[npm-image]: https://img.shields.io/npm/v/express-ajv-swagger-validation.svg?style=flat
[npm-url]: https://npmjs.org/package/express-ajv-swagger-validation
[travis-image]: https://travis-ci.org/Zooz/express-ajv-swagger-validation.svg?branch=master
[travis-url]: https://travis-ci.org/Zooz/express-ajv-swagger-validation
[coveralls-image]: https://coveralls.io/repos/github/Zooz/express-ajv-swagger-validation/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/Zooz/express-ajv-swagger-validation?branch=master
[downloads-image]: http://img.shields.io/npm/dm/express-ajv-swagger-validation.svg?style=flat
[downloads-url]: https://npmjs.org/package/express-ajv-swagger-validation
[license-image]: https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat
[license-url]: LICENSE
