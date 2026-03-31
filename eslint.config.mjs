import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'eslint.config.mjs', 'apps/tools/**', 'eslint.config.mjs'],
  },

  js.configs.recommended,

  // ✅ base TS (no type-aware)
  ...tseslint.configs.recommended,

  /* ---------------- API ---------------- */
  {
    files: ['apps/api/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./apps/api/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  // ✅ type-aware rules (절대 객체에 spread 금지)
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['apps/api/**/*.ts'],
  })),

  {
    files: ['apps/api/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },

  /* ---------------- ADMIN ---------------- */
  {
    files: ['apps/admin/**/*.{ts,tsx}'],
    ignores: ['**/*.config.ts'],

    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  /* ---------------- CONFIG FILE ---------------- */
  {
    files: ['**/*.config.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
  },

  /* ---------------- PRISMA ---------------- */
  {
    files: ['packages/prisma/**/*.ts'],
    rules: {
      '@typescript-eslint/await-thenable': 'off',
    },
  },

  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
];
