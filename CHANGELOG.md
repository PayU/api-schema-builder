# Master

# 3.0.0-rc.1 - 19 June, 2026
### Breaking changes
- **Upgraded ajv from v6 to v8** — error messages changed from "should" to "must" (see [MIGRATION.md](./MIGRATION.md) for full mapping)
- **Validation error ordering** may differ from v2 (e.g., `required` errors may appear before `additionalProperties`)
- **Custom keywords** (`ajv-keywords` v5): `schemaPath` and `params` format changed for sub-keyword errors
- Upgraded eslint from v8 to v10 requiring new flat config format
- Dropped Node.js support below version 24
- Removed eslint-config-standard (incompatible with eslint v10)
- Removed eslint-plugin-node, eslint-plugin-standard, and eslint-plugin-import
- Updated minimum Node.js version from ">=8" to ">=24"

### New features
- **OpenAPI 3.0 `nullable` support for Ajv v8** — `nullable: true` is automatically converted to `type: [T, "null"]`
- **`instancePath` → `dataPath` normalization** — Ajv v8's `instancePath` (JSON Pointer format) is automatically converted to dot-notation `dataPath` for backward compatibility

### Dependencies
- ajv: ^6.12.6 → ^8.20.0
- Added ajv-formats: ^3.0.1 for ajv v8 format validators
- decimal.js: ^10.3.1 → ^10.6.0
- js-yaml: ^3.14.1 → ^4.2.0
- openapi-schema-validator: ^3.0.3 → ^12.1.3
- ajv-keywords: ^3.5.2 → ^5.1.0
- chai: ^4.3.4 → ^4.5.0
- chai-as-promised: ^7.1.1 → ^7.1.2
- eslint: ^8.5.0 → ^10.5.0
- Removed eslint-plugin-import (incompatible with eslint v10)
- eslint-plugin-n: ^11.1.0 → ^16.6.2
- eslint-plugin-promise: ^4.3.1 → ^6.6.0
- eslint-plugin-chai-friendly: ^0.6.0 → ^1.2.1
- mocha: ^8.4.0 → ^11.7.6
- nyc: ^15.1.0 → ^18.0.0
- snyk: ^1.812.0 → ^1.1305.1
- uuid: ^8.3.2 → ^14.0.0

### Code changes
- Added `normalizeAjvErrors` utility to convert Ajv v8 errors (`instancePath`) to v6-compatible format (`dataPath`)
- Added `convertNullable` to transform OpenAPI 3.0 `nullable: true` to Ajv v8-compatible `type` arrays
- Updated `addKeyword` calls to use Ajv v8 API format (`{ keyword, ...definition }`)
- Added ajv-formats support for ajv v8 format validators
- Updated all Ajv instances to use `addFormats(ajv)` and `strict: false` for v8 compatibility
- Updated ajv-keywords import paths for v5 compatibility
- Removed deprecated `nullable` option from Ajv configurations
- Updated test assertions for Ajv v8 error message format and ordering changes
- Created eslint.config.js for ESLint v10 flat config format
- Excluded eslint.config.js from nyc coverage reporting

### Migration
See [MIGRATION.md](./MIGRATION.md) for a detailed migration guide including a full error message mapping table.

### CI/CD
- Updated GitHub Actions to use latest action versions
- Updated Node.js test matrix to [24]
- Updated default Node.js version to 24
- Updated actions/checkout@v4 → @v5
- Updated actions/setup-node@v4
- Updated actions/upload-artifact@v4 → @v6
- Updated actions/download-artifact@v4 → @v6
- Updated github/codeql-action/*@v1 → @v3
- Updated coverallsapp/github-action@master → @v2

# 2.0.5 - 1 February, 2021
### Improvements
- Added basic support for relative URLs #59
- Update dependencies to fix security vulnerabilities

# 2.0.4 - 26 Nov, 2020
### Improvements
- Nullable is now fully supported
- Update dependencies to fix security vulnerabilities

# 2.0.2 - 7 July, 2020

### Improvements

- Speed-up `api-schema-builder` import by lazy loading required dependencies #54


# 2.0.1 - 13 May, 2020

### Improvements

- Support empty servers in OpenAPI 3.0 spec #50


# 2.0.0 - 23 April, 2020

### New features

- Support for servers and base path in OAS 3 #46

### Improvements

- Speed-up import of `api-schema-builder` and reduce total bundle size by removing polyfills #45

### Breaking changes

- Validate loaded OpenAPI specification (throws an error if it's not a valid OpenAPI 3.0 document) #47
- Drop Node 6 support #45
- If your OpenAPI 3.x specification includes servers definition, some of the endpoints that weren't being matched for validation in the past can start getting validated (if any of servers + path combination matches) #46
