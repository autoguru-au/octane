module.exports = {
	extends: ['plugin:react/recommended'],

	plugins: ['react', 'react-hooks', 'jsx-a11y'],

	settings: {
		react: {
			version: '>16',
		},
	},

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
		'react/display-name': 'off',
		'react/react-in-jsx-scope': 'off', // React 17 doesnt need this anymore

		// https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/master/docs/rules
		'jsx-a11y/accessible-emoji': 'warn',
		'jsx-a11y/alt-text': 'warn',
		'jsx-a11y/anchor-has-content': 'warn',
		'jsx-a11y/anchor-is-valid': [
			'warn',
			{
				aspects: ['noHref', 'invalidHref'],
			},
		],
		'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
		'jsx-a11y/aria-props': 'warn',
		'jsx-a11y/aria-proptypes': 'warn',
		'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
		'jsx-a11y/aria-unsupported-elements': 'warn',
		'jsx-a11y/heading-has-content': 'warn',
		'jsx-a11y/iframe-has-title': 'warn',
		'jsx-a11y/img-redundant-alt': 'warn',
		'jsx-a11y/no-access-key': 'warn',
		'jsx-a11y/no-distracting-elements': 'warn',
		'jsx-a11y/no-redundant-roles': 'warn',
		'jsx-a11y/role-has-required-aria-props': 'warn',
		'jsx-a11y/role-supports-aria-props': 'warn',
		'jsx-a11y/scope': 'warn',
	},
};
