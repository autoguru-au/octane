module.exports = {
	plugins: ['simple-import-sort'],

	extends: ['kentcdodds/import'],

	rules: {
		'simple-import-sort/sort': 'error',
		'sort-imports': 'off',
		'import/order': 'off',

		'import/extensions': [
			'error',
			'never',
			{
				graphql: 'always',
				scss: 'always',
			},
		],
	},
};
