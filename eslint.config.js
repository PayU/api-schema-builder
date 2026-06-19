const nPlugin = require('eslint-plugin-n');
const promisePlugin = require('eslint-plugin-promise');
const chaiFriendlyPlugin = require('eslint-plugin-chai-friendly');

module.exports = [
  {
    plugins: {
      n: nPlugin,
      promise: promisePlugin,
      'chai-friendly': chaiFriendlyPlugin
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly'
      }
    },
    rules: {
      'eol-last': 'off',
      'space-before-function-paren': 'off',
      'indent': ['error', 4],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always', { omitLastInOneLineBlock: true }],
      'one-var': 'off',
      'space-before-blocks': 'off',
      'camelcase': 'warn',
      'no-console': 'error',
      'no-useless-return': 'off'
    }
  }
];
