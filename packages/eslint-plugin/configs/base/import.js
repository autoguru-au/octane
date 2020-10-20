module.exports = {
	extends: ['plugin:import/errors', 'plugin:import/warnings'],

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
	},
};
