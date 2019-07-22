module.exports = {
	extends: [
		'@autoguru/eslint-config',
		'xo-typescript',
		'plugin:import/typescript',
	],

	rules: {
		'@typescript-eslint/camelcase': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/generic-type-naming': 'off',
		'@typescript-eslint/indent': 'off',
		'@typescript-eslint/no-require-imports': 'off',
	},
};
