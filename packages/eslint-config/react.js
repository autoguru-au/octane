module.exports = {
	extends: ['xo-react', 'prettier/react'],

	rules: {
		'react/button-has-type': 'off',
		'react/jsx-tag-spacing': [
			'error',
			{
				afterOpening: 'never',
				beforeClosing: 'never',
				beforeSelfClosing: 'always',
				closingSlash: 'never',
			},
		],
		'react/no-array-index-key': 'off',
		'react/no-children-prop': 'warn',
		'react/no-unescaped-entities': 'warn',
		'react/prop-types': 'off',
	},
};
