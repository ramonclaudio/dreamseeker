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
  // Block raw query/mutation imports in Convex files — use authQuery/authMutation
  {
    files: ['convex/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['*/_generated/server'],
          importNames: ['query', 'mutation'],
          message: 'Use authQuery/authMutation from ./functions instead.',
        }],
      }],
    },
  },
  // Exceptions: files that legitimately need raw query/mutation
  {
    files: [
      'convex/functions.ts',
      'convex/auth.ts',
      'convex/users.ts',
      'convex/notificationsTokens.ts',
      'convex/notificationsSend.ts',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },
]);
