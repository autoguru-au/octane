const { RuleTester } = require('eslint');

const { 'no-tref': noTref } = require('.');

const ruleTester = new RuleTester({
	parserOptions: {
		ecmaVersion: 8,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
});

ruleTester.run('no-tref', noTref, {
	valid: [
		{
			code: '<button onClick={null} data-tref="abc123"/>',
		},
		{
			code: '<Button onClick={null} __tref="abc123"/>',
		},
		{
			code: '<button/>',
		},
		{
			code: '<button is={<a href="" data-tref="abc123"/>}/>',
		},
		{
			code: `const props = {onClick() {return null;}, ['__tref']: 'abc'}; <Link {...props}/>;`,
		},
		{
			code: `const props = {onClick() {return null;}, ['data-tref']: 'abc'}; <a {...props}/>;`,
		},
		{
			code: `const props = {onClick() {return null;}, __tref: 'abc'}; <Button {...props}/>;`,
		},
	],
	invalid: [
		{
			code: '<button onClick={null}/>',
			errors: [{ messageId: 'requiredAttribute' }],
		},
		{
			code: '<button is={<a href=""/>} />',
			errors: [{ messageId: 'requiredAttribute' }],
		},
		{
			code: '<Button onClick={null}/>',
			errors: [{ messageId: 'requiredAttribute' }],
		},
		{
			code: '<a href="test"/>',
			errors: [{ messageId: 'requiredAttribute' }],
		},
		{
			code: `const props = {onClick() {return null;}}; <Button {...props}/>;`,
			errors: [{ messageId: 'requiredAttribute' }],
		},
	],
});
