const { RuleTester } = require('eslint');

const rule = require('./lib/rules/has-tref');

const ruleTester = new RuleTester({
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester
	.run('has-tref', rule, {
		valid: [
			{
				code: '<button onClick={null} data-tref="abc123"/>',

			},
			{
				code: '<Button onClick={null} tref="abc123"/>',
			},
			{
				code: '<button/>',
			},
		],
		invalid: [
			{
				code: '<button onClick={null}/>',
				errors: [
					{ message: 'This node is tracked by Heap, make sure you give it an [data-tref]' },
				],
			},
			{
				code: '<a href="test"/>',
				errors: [
					{ message: 'This node is tracked by Heap, make sure you give it an [data-tref]' },
				],
			},
		],
	});
