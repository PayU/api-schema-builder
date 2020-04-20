# Master (Unreleased)

# 2.0.0 - ?? April, 2020

### Improvements

- Speed-up import of `api-schema builder` and reduce total bundle size by removing polyfills #45

### Breaking changes

- Validate loaded OpenAPI specification (throws an error if it's not a valid OpenAPI 3.0 document) #47
- Drop Node 6 support #45