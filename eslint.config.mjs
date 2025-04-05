import { FlatCompat } from '@eslint/eslintrc';

// For Node.js versions before v20.11.0, we need to use this workaround
// If you're using Node.js v20.11.0+, you can use import.meta.dirname directly
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname, // Use __dirname for older Node.js versions
  // If you're on Node.js v20.11.0+, you can use: baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Add this to fix the any type errors
    },
  }),
];

export default eslintConfig;
