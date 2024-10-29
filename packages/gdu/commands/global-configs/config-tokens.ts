import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';

import { getTokens } from '../../lib/globalConfigs';

const envs = ['uat', 'preprod', 'dev', 'prod_build', 'test', 'tokens'];
const tenants = ['au', 'nz', 'au-legacy'];
type ENV = (typeof envs)[number];
type TENANT = (typeof tenants)[number] ;


export default async () => {
	console.log('Global config tokens started');
	const TOKENS = await getTokens();

	// eslint-disable-next-line unicorn/consistent-function-scoping
	const getFileName = (env: ENV) => {
		switch (env) {
			case 'prod_build':
				return 'prod';
			default:
				return env;
		}
	};

	const defaultsFile = path.join(
		process.cwd(),
		'.gdu_config',
		'.env.defaults',
	);

	const destinationFolder = path.join(
		process.cwd(),
		'.mfe-data',
		'env-configs',
	);

	const copyTokens = () => {
		const prodFile = path.join(
			process.cwd(),
			'.gdu_config',
			'.env.prod',
		);
		const tokensFile = path.join(
			process.cwd(),
			'.gdu_config',
			'.env.tokens',
		);

		// Extract text from prod file
		const prodText = fs.readFileSync(prodFile, 'utf8');
		// replace #{*****} with "#{*****}" where ***** can be any value with any length
		const tokensText = prodText.replace(/#{(.*?)}/g, '"#{$1}"');
		// Write the tokens file
		fs.writeFileSync(
			tokensFile,
			`# This file automatically generated from .env.prod file. \r${tokensText}`,
		);
	};

	const generateTokens = (env: ENV, tenant?: TENANT) => {
		if (env === 'tokens') {
			copyTokens();
		}
		const envFile = path.join(
			process.cwd(),
			'.gdu_config',
			tenant ? `.env.${env}_${tenant}` : `.env.${env}`,
		);
		dotenv.config({ path: [defaultsFile, envFile], override: true });

		const FILTERED_TOKENS = Object.keys(TOKENS).reduce((acc, key) => {
			if (process.env[key])
				acc[key] = process.env[key];
			return acc;
		}, {});

		const data = JSON.stringify(FILTERED_TOKENS, null, 2);

		fs.writeFileSync(
			path.join(
				destinationFolder,
				tenant
					? `${getFileName(env)}_${tenant}.json`
					: `${getFileName(env)}.json`,
			),
			data,
		);
	};

	envs.forEach((env: ENV) => {
		if (env !== 'tokens') {
			tenants.forEach((tenant: TENANT) => {
				generateTokens(env, tenant);
			});
		}
	});
	console.log('Global config tokens finished');

}
