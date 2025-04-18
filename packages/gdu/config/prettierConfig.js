module.exports = {
	printWidth: 80,
	bracketSpacing: true,
	jsxBracketSameLine: true,
	semi: true,
	singleQuote: true,
	useTabs: true,
	tabWidth: 4,
	trailingComma: 'all',
	proseWrap: 'always',
	overrides: [
		{
			files: ['**/package.json', '**/.*.yml', '**/*.yml'],
			options: {
				printWidth: 999,
				tabWidth: 2,
				useTabs: false,
			},
		},
	],
};
