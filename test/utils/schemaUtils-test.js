const schemaUtils = require('../../src/utils/schemaUtils');
const { expect } = require('chai');

describe('schemaUtils', () => {
    describe('getAllResponseContentTypes', () => {
        it('correctly handles no responses', () => {
            const result = schemaUtils.getAllResponseContentTypes([]);
            expect(result).to.deep.equal([schemaUtils.DEFAULT_RESPONSE_CONTENT_TYPE]);
        });

        it('correctly handles nil responses', () => {
            const result = schemaUtils.getAllResponseContentTypes();
            expect(result).to.deep.equal([schemaUtils.DEFAULT_RESPONSE_CONTENT_TYPE]);
        });

        it('does not store duplicates', () => {
            const result = schemaUtils.getAllResponseContentTypes([
                {
                    content: {
                        'application/hal+json': {}
                    }
                },
                {
                    content: {
                        'application/hal+json': {}
                    }
                }
            ]);
            expect(result.length).to.equal(1);
        });

        it('stores default if content type is not resolved', () => {
            const result = schemaUtils.getAllResponseContentTypes([
                {},
                {
                    content: {
                        'application/hal+json': {}
                    }
                }
            ]);
            expect(result).to.have.members(['application/hal+json', 'application/json']);
        });
    });
});
