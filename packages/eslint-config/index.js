module.exports = {
	extends: ['xo/esnext', 'plugin:unicorn/recommended', 'prettier'],

	rules: {
		'func-names': ['warn', 'always'],
		'no-void': 'off',
		'no-warning-comments': ['off', { terms: ['TODO'] }],
		'unicorn/filename-case': 'off',
		'unicorn/prevent-abbreviations': 'off',
		'no-multi-assign': 'warn',
		camelcase: 'off',
	},
};
