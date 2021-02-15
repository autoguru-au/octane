const { transform } = require('@babel/core');

process.env.APP_ENV = 'base';

transform(
	`
// BOUNDARY START
import gdu_config from './babel/config.macro';
global['GDU_CONFIG'] = gdu_config;
// BOUNDARY END

import React from 'react';
import * as config from 'gdu/config';
import { api } from 'gdu/config';
import { auth, url as url2 } from 'gdu/config';
`,
	{
		babelrc: false,
		cwd: __dirname,
		plugins: [
			require.resolve('babel-plugin-macros'),
			require('./config-plugin'),
		],
	},
	(err, result) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log(result.code);
	},
);
