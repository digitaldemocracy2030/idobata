import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends('plugin:react-hooks/recommended'),
  ...compat.extends('plugin:react-refresh/recommended'),
  ...compat.extends('prettier'),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      // TypeScript関連のルールを一時的に緩和
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  }
];
