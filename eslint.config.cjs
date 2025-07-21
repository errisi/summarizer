module.exports = [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        browser: true,
        es2020: true,
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'react-refresh': require('eslint-plugin-react-refresh'),
      'prettier': require('eslint-plugin-prettier'),
    },
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-extraneous-import': 'off',
      'n/no-extraneous-require': 'off',
      'no-unsafe-optional-chaining': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prettier/prettier': 'error',
    },
  },
  {
    ignores: ['dist', 'node_modules', '.eslintrc.cjs'],
  },
];
