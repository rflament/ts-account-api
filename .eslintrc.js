module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "@typescript-eslint/quotes": ['error', 'single']
  }
  ,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
};