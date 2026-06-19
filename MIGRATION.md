# Migration Guide: v2.x → v3.x

This document describes all breaking changes introduced in `api-schema-builder` v3.0.0 and provides guidance on how to update your code.

## Why v3?

The core validation engine was upgraded from **Ajv v6** to **Ajv v8**. This is a major upgrade that brings performance improvements, better JSON Schema support, and stricter validation — but it also changes the format of validation error objects.

Additionally, all other dependencies have been bumped to their latest versions:
- `ajv`: `^6.12.6` → `^8.20.0`
- `ajv-formats`: (new) `^3.0.1` — formats are now a separate package in Ajv v8
- `ajv-keywords`: `^3.5.2` → `^5.1.0`
- `openapi-schema-validator`: `^3.0.3` → `^12.1.3`
- `js-yaml`: `^3.14.1` → `^4.2.0`
- `mocha`: `^8.4.0` → `^11.7.6`
- And others (see `package.json` for full list)

**Minimum Node.js version**: `>=18` (was `>=10`)

---

## Breaking Changes

### 1. Validation Error Messages

Ajv v8 changed all error messages from **"should"** to **"must"**. If your code inspects `error.message` strings from validation results, you will need to update your string comparisons.

#### Message Mapping

| v2 (Ajv v6) | v3 (Ajv v8) |
|---|---|
| `should be string` | `must be string` |
| `should be number` | `must be number` |
| `should be integer` | `must be integer` |
| `should be boolean` | `must be boolean` |
| `should be object` | `must be object` |
| `should be array` | `must be array` |
| `should be <= N` | `must be <= N` |
| `should be >= N` | `must be >= N` |
| `should have required property 'X'` | `must have required property 'X'` |
| `should match pattern "X"` | `must match pattern "X"` |
| `should match format "X"` | `must match format "X"` |
| `should match some schema in anyOf` | `must match a schema in anyOf` |
| `should match exactly one schema in oneOf` | `must match exactly one schema in oneOf` |
| `should be equal to one of the allowed values` | `must be equal to one of the allowed values` |
| `should NOT be shorter than N characters` | `must NOT have fewer than N characters` |
| `should NOT be valid` | `must NOT be valid` |
| `should NOT have additional properties` | `must NOT have additional properties` |
| `should pass "X" keyword validation` | `must pass "X" keyword validation` |

#### Example

```js
// v2
if (error.message === 'should be string') { ... }

// v3
if (error.message === 'must be string') { ... }
```

#### Quick Migration

If you have many string comparisons, a simple find-and-replace approach works:

```
"should be string"      → "must be string"
"should have required"  → "must have required"
"should match pattern"  → "must match pattern"
"should match format"   → "must match format"
"should NOT"            → "must NOT"
"should pass"           → "must pass"
"should match some schema in anyOf" → "must match a schema in anyOf"
"should match exactly one schema in oneOf" → "must match exactly one schema in oneOf"
```

> **Note**: The `anyOf` message also changed wording: "should match **some** schema" → "must match **a** schema"

---

### 2. Error Object Structure

The `dataPath` field is preserved on all errors produced by this library's validators (request, response, body, headers). However, the underlying Ajv v8 error objects no longer include `dataPath` natively — they use `instancePath` instead.

This library converts `instancePath` back to `dataPath` for backward compatibility with the same dot-notation format (e.g., `.body.name`, `.headers['x-zooz-request-id']`).

**What stays the same:**
- `error.dataPath` — still uses dot notation (`.body`, `.body.name`, `.query`, `.path`)
- `error.keyword` — unchanged
- `error.params` — unchanged (with minor exceptions, see below)
- `error.schemaPath` — unchanged for standard keywords

**What may differ:**
- Errors from `openapi-schema-validator` (OpenAPI spec validation errors thrown during schema loading) will have `instancePath` instead of `dataPath`, since they come directly from the external library.

---

### 3. Error Ordering

Ajv v8 may produce validation errors in a **different order** than Ajv v6. For example:

```
// v2: additionalProperties error comes first, then required
// v3: required error comes first, then additionalProperties
```

If your code relies on the specific ordering of errors in the `errors` array, you should update it to be order-independent or sort errors before comparing.

---

### 4. Custom Keywords (`ajv-keywords`)

If you use custom keywords via the `keywords` option (e.g., `range`, `prohibited`):

- **`schemaPath`** format changed. Sub-keyword errors now include the parent keyword in the path:
  - v2: `#/properties/age/maximum` → v3: `#/properties/age/range/maximum`
  - v2: `#/not` → v3: `#/prohibited/not`

- **`params`** for custom keyword wrapper errors no longer include `keyword`:
  - v2: `{ keyword: 'range' }` → v3: `{}`

- **Import paths** for `ajv-keywords` changed:
  - v2: `require('ajv-keywords/keywords/range')`
  - v3: `require('ajv-keywords/dist/keywords/range')`

---

### 5. OpenAPI 3.0 `nullable` Support

In Ajv v8, the `nullable` keyword from OpenAPI 3.0 is no longer natively supported. This library now automatically converts `nullable: true` to the equivalent JSON Schema representation:

- `{ type: "string", nullable: true }` → `{ type: ["string", "null"] }`
- `{ nullable: true }` (without type) → `{ oneOf: [{...}, { type: "null" }] }`

This should be transparent to users — nullable fields will continue to accept `null` values as expected.

---

### 6. `addKeyword` API Change

If you register custom Ajv keywords through the `keywords` option using `{ name, definition }` objects, the library now passes them to Ajv v8 using the new API format:

```js
// v2 (Ajv v6): ajv.addKeyword(name, definition)
// v3 (Ajv v8): ajv.addKeyword({ keyword: name, ...definition })
```

This is handled internally — no changes needed in your code unless you are passing raw Ajv keyword definitions that rely on the old parameter format.

---

### 7. Strict Mode

Ajv v8 is more strict by default. The library sets `strict: false` to maintain compatibility with OpenAPI schemas that may use non-standard keywords. If you pass custom `ajvConfigBody` or `ajvConfigParams` options, be aware that `strict: true` may cause failures with OpenAPI-specific keywords.

---

## How to Migrate

1. **Update your dependency**: `npm install api-schema-builder@3`
2. **Search your codebase** for any string comparisons against validation error messages (see the mapping table above)
3. **Update error message assertions** in your tests from "should" to "must"
4. **Check error ordering** — if you compare full error arrays with deep equality, the order may have changed
5. **Update `ajv-keywords` imports** if you use them directly: `keywords/` → `dist/keywords/`
6. **Ensure Node.js >= 18**

---

## Need Help?

If you encounter issues during migration, please [open an issue](https://github.com/PayU/api-schema-builder/issues) with details about the error and your schema.
