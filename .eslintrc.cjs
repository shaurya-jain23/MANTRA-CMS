module.exports = {
  env: { browser: true, es2021: true },
  extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
  parserOptions: { ecmaVersion: 2021, sourceType: "module" },
  plugins: ["react"],
  rules: {},
  settings: {
    react: { version: "detect" }
  }
};
