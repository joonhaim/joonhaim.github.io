import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", ".git/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        L: "readonly",
        html2pdf: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
