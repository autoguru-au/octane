import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import reactEslint from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import sonarjs from 'eslint-plugin-sonarjs';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

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

			'unicorn/import-style': 'off',

			'import/namespace': 'off', // breaks??
		},
	},
];

// Eslint base config
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
			'func-names': ['warn', 'always'],
			'no-multi-assign': 'warn',
			'no-void': 'off',
			'new-cap': 'off',
			'no-warning-comments': ['off', { terms: ['TODO'] }],
			camelcase: 'off',
			'promise/always-return': 'warn',
			'promise/catch-or-return': 'warn',
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

// Eslint react config
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
			'react/no-array-index-key': 'off',
			'react/no-children-prop': 'warn',
			'react/no-unescaped-entities': 'warn',
			'react/prop-types': 'off',
			'react/display-name': 'off',
			'react/react-in-jsx-scope': 'off', // React 17 doesnt need this anymore

			// https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/master/docs/rules
			'jsx-a11y/accessible-emoji': 'warn',
			'jsx-a11y/alt-text': 'warn',
			'jsx-a11y/anchor-has-content': 'warn',
			'jsx-a11y/anchor-is-valid': [
				'warn',
				{
					aspects: ['noHref', 'invalidHref'],
				},
			],

			// JSX A11y rules
			'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
			'jsx-a11y/aria-props': 'warn',
			'jsx-a11y/aria-proptypes': 'warn',
			'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
			'jsx-a11y/aria-unsupported-elements': 'warn',
			'jsx-a11y/heading-has-content': 'warn',
			'jsx-a11y/iframe-has-title': 'warn',
			'jsx-a11y/img-redundant-alt': 'warn',
			'jsx-a11y/no-access-key': 'warn',
			'jsx-a11y/no-distracting-elements': 'warn',
			'jsx-a11y/no-redundant-roles': 'warn',
			'jsx-a11y/role-has-required-aria-props': 'warn',
			'jsx-a11y/role-supports-aria-props': 'warn',
			'jsx-a11y/scope': 'warn',
		},
	},
];

// TypeScript rules
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
			'@typescript-eslint/camelcase': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/generic-type-naming': 'off',
			'@typescript-eslint/indent': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/ban-types': 'off', // Complains about Omit so cya
			'sonarjs/no-duplicate-string': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/ban-ts-comment': 'warn',
			'@typescript-eslint/no-use-before-define': 'warn',

			// SonarJS rules
			'sonarjs/no-duplicate-string': 'warn',
			'sonarjs/slow-regex': 'warn',
			'sonarjs/todo-tag': 'off',
		},
	},
];

export const jest = [
	...fixupConfigRules(compat.extends('plugin:jest/recommended')),
	{
		plugins: {
			jest: fixupPluginRules(jest),
		},

		rules: {
			'jest/prefer-called-with': 'warn',
		},
	},
];
