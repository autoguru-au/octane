// eslint-disable-next-line unicorn/prefer-module
module.exports = {
	extends: [
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/typescript',
		'plugin:sonarjs/recommended',
	],

	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
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
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/ban-ts-comment': 'warn',

		'@typescript-eslint/no-use-before-define': 'warn',
	},
};
