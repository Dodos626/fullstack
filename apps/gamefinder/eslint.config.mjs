import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig([
    globalIgnores(['.next/**', 'out/**']),
    {
        files: ['**/*.{js,jsx,mjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: globals.browser,
            sourceType: 'module',
        },
        rules: js.configs.recommended.rules,
    },
    ...nextCoreWebVitals,
    prettier,
]);