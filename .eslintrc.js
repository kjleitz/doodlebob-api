/* eslint-env node */

module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // "prettier",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  rules: {
    // "@typescript-eslint/indent": ["error", 2, { SwitchCase: 1, ignoreComments: true }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_|request|response|next", varsIgnorePattern: "^_" }],
    // "@typescript-eslint/semi": ["error", "always", { "omitLastInOneLineBlock": true }],
    // "comma-dangle": ["error", "always-multiline"],
    "eqeqeq": ["error", "always"],
    // "indent": "off", // conflicts with TS' indent rule
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_|request|response|next", varsIgnorePattern: "^_" }],
    // "no-trailing-spaces": "error",
    // "semi": "off", // conflicts with TS' semi rule; see https://github.com/typescript-eslint/typescript-eslint/issues/123
  },
};
