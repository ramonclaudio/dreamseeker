// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactCompiler = require('eslint-plugin-react-compiler');

module.exports = defineConfig([
  globalIgnores(['dist/*', '.expo/*']),
  expoConfig,
  reactCompiler.configs.recommended,
  {
    rules: {
      // TypeScript handles module resolution - disable ESLint import checks
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
    },
  },
]);
