// eslint-disable-next-line unicorn/prefer-module
module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'scope-case': [0],
		'subject-case': [2, 'always', 'sentence-case'],
		'type-enum': [
			2,
			'always',
			[
				'chore',
				'docs',
				'feat',
				'fix',
				'perf',
				'refactor',
				'style',
				'revert',
				'test',
				'ci',
			],
		],
	},
};
