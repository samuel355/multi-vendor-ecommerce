export default {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Allow the use of 'any' for error types in catch blocks
    '@typescript-eslint/no-explicit-any': 'off', // Turn off the rule for 'any'
  },
};