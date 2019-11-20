module.exports = {
	extends: [
		'xo/esnext',
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
		'promise/always-return': 'warn',
		'promise/catch-or-return': 'warn',
		'unicorn/filename-case': 'off',
		'unicorn/prevent-abbreviations': 'off',
		camelcase: 'off',
	},
};
