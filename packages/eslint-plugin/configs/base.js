module.exports = {
	extends: [
		'xo/esnext',
		'plugin:unicorn/recommended',
		'kentcdodds/import',
		'plugin:promise/recommended',
		'prettier',
	],

	rules: {
		'func-names': ['warn', 'always'],
		'no-multi-assign': 'warn',
		'no-void': 'off',
		'no-warning-comments': ['off', { terms: ['TODO'] }],
		'promise/always-return': 'warn',
		'promise/catch-or-return': 'warn',
		'unicorn/filename-case': 'off',
		'unicorn/prevent-abbreviations': 'off',
		camelcase: 'off',
	},
};
