import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';

import reactEslint from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import sonarjs from 'eslint-plugin-sonarjs';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

// Eslint configs for import statements
export const imports = [
	...fixupConfigRules(compat.extends('plugin:import/errors')),
	{
		rules: {
			'import/order': [
				'error',
				{
					'newlines-between': 'always',
					alphabetize: { order: 'asc' },
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
					pathGroups: [
						{
							pattern: '*.+(treat)',
							group: 'index',
							position: 'after',
							patternOptions: { matchBase: true },
						},
					],
				},
			],
			'import/no-unresolved': 'off', // Just too many problems...
			'import/default': 'off',
			'import/extensions': [
				'error',
				'never',
				{
					graphql: 'always',
					treat: 'always',
					scss: 'always',
				},
			],
			'import/no-duplicates': 'error',

			'import/namespace': 'off', // breaks??
		},
	},
];

// Eslint base config including import
export const base = [
	...imports,
	...fixupConfigRules(
		compat.extends(
			'plugin:unicorn/recommended',
			'plugin:promise/recommended',
			'prettier',
		),
	),
	{
		languageOptions: {
			sourceType: 'module',

			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},

		rules: {
			'unicorn/filename-case': 'off',
			'unicorn/prevent-abbreviations': 'off',
			'unicorn/no-null': 'off',
			'unicorn/no-reduce': 'off',
			'unicorn/no-array-reduce': 'off',
			'unicorn/no-array-for-each': 'off',
			'unicorn/no-array-push-push': 'off',
			'unicorn/prefer-spread': 'warn',
		},
	},
];

// Eslint react plugins, settings and rules
export const react = [
	...fixupConfigRules(
		compat.extends(
			'plugin:react/recommended',
			'plugin:react-hooks/recommended',
		),
	),
	{
		plugins: {
			react: fixupPluginRules(reactEslint),
			'react-hooks': fixupPluginRules(reactHooks),
			'jsx-a11y': jsxA11Y,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			'react/no-array-index-key': 'warn',
			'react/prop-types': 'off',
			'react/display-name': 'off',
		},
	},
];

// TypeScript plugins, and SonarJS plugin settings and rules
export const typescript = [
	...fixupConfigRules(
		compat.extends(
			'plugin:@typescript-eslint/eslint-recommended',
			'plugin:@typescript-eslint/recommended',
			'plugin:import/typescript',
			'plugin:sonarjs/recommended-legacy',
		),
	),
	{
		plugins: {
			sonarjs: fixupPluginRules(sonarjs),
		},
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 2020,
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			'import/resolver': {
				typescript: {},
			},
		},
		rules: {
			'sonarjs/no-duplicate-string': 'warn',
			'sonarjs/slow-regex': 'warn',
			'sonarjs/todo-tag': 'off',
		},
	},
];
