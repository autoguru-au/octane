#!/usr/bin/env node
/* eslint-disable unicorn/prefer-module */
if (process.argv.includes('--debug')) {
	process.env.DEBUG = 'gdu:*';
}

require('../dist/cli').default(process.argv);
