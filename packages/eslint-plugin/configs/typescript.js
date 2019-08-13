module.exports = {
	extends: [
		'plugin:@autoguru/base',
		'xo-typescript',
		'plugin:import/typescript',
	],

	rules: {
		'@typescript-eslint/camelcase': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/generic-type-naming': 'off',
		'@typescript-eslint/indent': 'off',
		'@typescript-eslint/no-require-imports': 'off',
		'@typescript-eslint/ban-types': 'off', // Complains about Omit so cya
		'@typescript-eslint/no-explicit-any': 'warn',
	},

	settings: {
		'import/resolver': {
			typescript: {},
		},
	},
};
