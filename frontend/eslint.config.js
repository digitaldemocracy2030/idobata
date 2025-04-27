import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends("plugin:react-hooks/recommended"),
  ...compat.extends("plugin:react-refresh/recommended"),
  ...compat.extends("prettier"),
  unusedImports.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // 未使用の変数に関するルール
      "no-unused-vars": "off", // 基本のルールをオフにして、TypeScriptのルールを使用
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // 未使用のインポートを自動的に削除
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // TypeScript関連のルールを一時的に緩和
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
];
