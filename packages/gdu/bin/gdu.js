#!/usr/bin/env node

if (process.argv.includes('--debug')) {
	process.env.DEBUG = 'gdu:*';
}

require('../dist/cli').default(process.argv);
