#!/usr/bin/env node
/* eslint-disable unicorn/prefer-module */
const {
	_: [type, app_name],
	debug,
} = require('mri')(process.argv.slice(2), {
	default: { debug: false },
});

if (debug) process.env.DEBUG = 'gdu:*';

if (typeof type === 'undefined' || typeof app_name === 'undefined')
	throw new Error('Please supply all arguments');

require('gdu/dist/commands/scaffold').default(type, app_name);
