// eslint.config.mjs
import js from '@eslint/js';

export default [
  { // ignore-ok (flat confignál fájllista elemben)
    ignores: ['node_modules/**', '.next/**', 'data/**'] // JSON-okat nem linteljük
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: (await import('@typescript-eslint/parser')).default },
    plugins: { '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin')).default },
    rules: {
      // ide jöhet pár finom szabály később
    }
  }
];
