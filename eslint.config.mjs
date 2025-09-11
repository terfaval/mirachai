// eslint.config.mjs
import js from '@eslint/js'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  // Ignore mintázatok (flat config)
  {
    ignores: ['node_modules/**', '.next/**', 'data/**', 'dist/**', 'coverage/**']
  },

  // Alap JS szabályok (JS/MJS/CJS fájlokra)
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.es2024,
        ...globals.browser,  // document, window, stb.
        ...globals.node      // process, __dirname, stb.
      }
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },

  // TypeScript / TSX szabályok
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.es2024,
        ...globals.browser,
        ...globals.node,
        React: 'readonly', // ha bárhol hivatkozol rá
        JSX: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks
    },
    rules: {
      // Kapcsold ki a sima JS szabályokat TS-re
      'no-undef': 'off',                 // TS tudja a típusokat (HTMLInputElement, stb.)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
]
