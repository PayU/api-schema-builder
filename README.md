
# api-schema-builder
[![NPM Version](https://img.shields.io/npm/v/api-schema-builder.svg?style=flat)](https://npmjs.org/package/api-schema-builder)
[![Build Status](https://travis-ci.org/payu/api-schema-builder.svg?branch=master)](https://travis-ci.org/payu/api-schema-builder)
[![Coverage Status](https://coveralls.io/repos/github/PayU/api-schema-builder/badge.svg?branch=master)](https://coveralls.io/github/PayU/api-schema-builder?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/npm/api-schema-builder/badge.svg)](https://snyk.io/test/npm/api-schema-builder)
[![Apache 2.0 License](https://img.shields.io/badge/license-Apache_2.0-green.svg?style=flat)](LICENSE)

This package is used to build schema for input validation base on openapi doc [Swagger (Open API)](https://swagger.io/specification/) definition and [ajv](https://www.npmjs.com/package/ajv)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  <!-- *generated with [DocToc](https://github.com/thlorenz/doctoc)* -->



- [Install](#install)
- [API](#api)
  - [How to use](#how-to-use)
  - [api-schema-builder.buildSchemaSync(PathToSwaggerFile, options)](#api-schema-buildergetSchemapathtoswaggerfile-options)
    - [Arguments](#arguments)
      - [Options](#options)
    - [Response](#response)
  - [api-schema-builder.buildSchemaSync(jsonSchema, options)](#api-schema-buildergetSchemajsonSchema-options)
  - [api-schema-builder.buildSchema(PathToSwaggerFile, options)](#api-schema-buildergetSchemaAsyncpathtoswaggerfile-options)
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
const apiSchemaBuilder = require('api-schema-builder');
```

### api-schema-builder.buildSchemaSync(PathToSwaggerFile, options)

Synchronously build schema that would contain ajv validators for each endpoint, based on swagger definition.

The function returns schema object.

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
        * `responses`: contain array of statusCodes
            * `statusCode`:
                * `validate`: ajv validator that check body and headers.
                * `errors`: in case of fail validation it return array of errors, otherwise return null


##### Options

Options currently supports:.
- `keywords` - Array of keywords that can be added to `ajv` configuration, each element in the array can be either an object or a function. 
If the element is an object, it must include `name` and `definition`. If the element is a function, it should accept `ajv` as its first argument and inside the function you need to call `ajv.addKeyword` to add your custom keyword 
- `makeOptionalAttributesNullable` - Boolean that forces preprocessing of Swagger schema to include 'null' as possible type for all non-required properties. Main use-case for this is to ensure correct handling of null values when Ajv type coercion is enabled
- `ajvConfigBody` - Object that will be passed as config to new Ajv instance which will be used for validating request body. Can be useful to e. g. enable type coercion (to automatically convert strings to numbers etc). See Ajv documentation for supported values.
- `ajvConfigParams` - Object that will be passed as config to new Ajv instance which will be used for validating request headers and parameters. See Ajv documentation for supported values.
- `contentTypeValidation` - Boolean that indicates if to perform content type validation in case `consume` field is specified and the request body is not empty.
- `expectFormFieldsInBody` - Boolean that indicates whether form fields of non-file type that are specified in the schema should be validated against request body (e. g. Multer is copying text form fields to body)
- `buildRequests` - Boolean that indicates whether if create validators for requests, default is true.
- `buildResponses` - Boolean that indicates whether if create validators for responses, default is false.
- `basePath` - Base path of the external definition files referenced in the given schema. This is required whenever passing json schema instead of `PathToSwaggerFile` to the constructor or the external files are not stored in the same path of `PathToSwaggerFile`
- `formats` - Array of formats that can be added to `ajv` configuration, each element in the array should include `name` and `pattern`.

  ```js
  formats: [
      { name: 'double', pattern: /\d+\.(\d+)+/ },
      { name: 'int64', pattern: /^\d{1,19}$/ },
      { name: 'int32', pattern: /^\d{1,10}$/ }
  ]
  ```

### api-schema-builder.buildSchema(jsonSchema, options)

Synchronously build schema that would contain ajv validators for each endpoint, based on given OpenAPI specification as json schema.

The function returns schema object.


### api-schema-builder.buildSchema(PathToSwaggerFile, options)

Asynchronously build schema that would contain ajv validators for each endpoint, based on swagger definition.

The function returns Promise that resolves with a schema object.
s
Arguments, options and response are the same as for the `buildSchemaSync` method.

## Usage Example

### Validate request
```js
  const schema = apiSchemaBuilder.buildSchemaSync('test/unit-tests/input-validation/pet-store-swagger.yaml');
  let schemaEndpoint = schema['/pet']['post'];

  //validate request's parameters
  let isParametersMatch = schemaEndpoint.parameters.validate({ query: {},
  headers: { 'public-key': '1.0'},path: {},files: undefined });
  expect(schemaEndpoint.parameters.errors).to.be.equal(null);
  expect(isParametersMatch).to.be.true;
    
  //validate request's body
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
  expect(isBodysMatch).to.be.false;
```
### Validate response
```js
  const schema = apiSchemaBuilder.buildSchemaSync('test/unit-tests/input-validation/pet-store-swagger.yaml');
  let schemaEndpoint = schema['/pet']['post'].responses['201'];
  //validate response's body and headers
  let isValid = schemaEndpoint.validate({
          body :{ id:11, 'name': 111},
          headers:{'x-next': '321'}
  })
  expect(schemaEndpoint.errors).to.be.eql([
    {
      'dataPath': '.body.name',
      'keyword': 'type',
      'message': 'should be string',
      'params': {
          'type': 'string'
      },
      'schemaPath': '#/body/properties/name/type'
  }])
  expect(isValid).to.be.false;
```

## Important Notes

- Objects - it is important to set any objects with the property `type: object` inside your swagger file, although it isn't a must in the Swagger (OpenAPI) spec in order to validate it accurately with [ajv](https://www.npmjs.com/package/ajv) it must be marked as `object`
- Response validator does not support readOnly attribute

## Open api 3 - known issues
- supporting inheritance with discriminator , only if the ancestor object is the discriminator.
- The discriminator supports in the inheritance chain stop when getting to a child with no discriminator (a leaf in the inheritance tree), meaning a leaf can't have a field which starts a new inheritance tree.
  so child with no discriminator cant point to other child with discriminator,
- Response validator support only application/json content type
- Response validator does not support links and writeOnly attribute

## Running Tests
Using mocha and istanbul
```bash
npm run test
```