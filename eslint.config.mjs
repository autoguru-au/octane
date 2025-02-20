import globals from 'globals';
import pluginJs from '@eslint/js';

import { base, typescript } from '@autoguru/eslint-plugin/config';
import { FlatCompat } from '@eslint/eslintrc';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: pluginJs.configs.recommended,
	allConfig: pluginJs.configs.all,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		ignores: ['**/node_modules', 'packages/*/dist/**'],
	},
	...base,
	...typescript,
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-require-imports': 'off',
			'promise/always-return': 'warn',
			'promise/catch-or-return': 'warn',
			'sonarjs/no-commented-code': 'off',
			'sonarjs/no-empty-test-file': 'warn',
			'unicorn/no-anonymous-default-export': 'off',
			'unicorn/no-typeof-undefined': 'warn',
			'unicorn/import-style': 'off',
			'unicorn/prefer-module': 'off',
			'unicorn/prefer-node-protocol': 'off',
		},
	},
	// ...compat.extends('plugin:jest/recommended-legacy').map((config) => ({
	// 	...config,
	// 	files: ['**/jest.*js', '**/*.spec.{js,jsx}'],
	// })),
	{
		files: ['**/jest.*js', '**/*.spec.{js,jsx}'],
		languageOptions: {
			globals: {
				...globals.jest,
				...globals.node,
			},
		},
	},
	{
		// rules just for GDU
		files: ['packages/gdu/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'sonarjs/no-nested-functions': 'warn',
			'sonarjs/redundant-type-aliases': 'warn',
			'unicorn/import-style': 'off',
			'unicorn/no-length-as-slice-end': 'warn',
			'unicorn/no-process-exit': 'warn',
			'unicorn/no-typeof-undefined': 'warn',
			'unicorn/prefer-node-protocol': 'off',
			'unicorn/prefer-string-replace-all': 'warn',
			'unicorn/switch-case-braces': 'warn',
		},
	},
];
