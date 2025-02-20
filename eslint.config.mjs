import { base, jest, typescript } from '@autoguru/eslint-plugin/config';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		ignores: ['**/node_modules', '**/dist/**'],
	},
	...base,
	...typescript,
	...jest,
	{
		// octane specific overrides
		rules: {
			'no-undef': 'warn',
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
	{
		// additional rules just for GDU
		files: ['packages/gdu/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/ban-ts-comment': 'off',
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
