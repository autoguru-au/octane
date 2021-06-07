/* eslint-disable unicorn/prefer-module */
module.exports = {
	parserOptions: {
		sourceType: 'module',
		ecmaFeatures: { jsx: true },
	},

	extends: [
		'plugin:unicorn/recommended',
		'plugin:promise/recommended',
		require.resolve('./import.js'),
		'prettier',
	],

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
};
