import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';
import { blue, dim } from 'kleur';

import { getTokens } from '../../lib/globalConfigs';

const envs = [
	'uat',
	'preprod',
	'dev',
	'prod_build',
	'test',
	'tokens',
	'shared',
];
const tenants = ['au', 'nz', 'global'];
type ENV = (typeof envs)[number];
type TENANT = (typeof tenants)[number];

export default async () => {
	console.log('Global config tokens started');
	const TOKENS = await getTokens();

	// eslint-disable-next-line unicorn/consistent-function-scoping
	const getFileName = (env: ENV) => {
		// eslint-disable-next-line sonarjs/no-small-switch
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
		const prodFile = path.join(process.cwd(), '.gdu_config', '.env.prod');
		const tokensFile = path.join(
			process.cwd(),
			'.gdu_config',
			'.env.tokens',
		);

		// Create .gdu_config directory if it doesn't exist
		fs.mkdirSync(path.dirname(tokensFile), { recursive: true });

		// Check if prod file exists
		if (!fs.existsSync(prodFile)) {
			console.log(
				`${dim('Info:')} Production file ${blue(
					prodFile,
				)} not found, skipping...`,
			);
			return;
		}

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

		// Show informative message if the env file does not exist
		if (!fs.existsSync(envFile)) {
			console.log(
				`${dim('Info:')} Environment file ${blue(
					envFile,
				)} not found, skipping...`,
			);
			return;
		}

		dotenv.config({ path: [defaultsFile, envFile], override: true });

		const FILTERED_TOKENS = Object.keys(TOKENS).reduce((acc, key) => {
			if (process.env[key]) acc[key] = process.env[key];
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

	// Create directories if they don't exist
	fs.mkdirSync(destinationFolder, { recursive: true });
	// clear all files in the destination folder
	fs.readdirSync(destinationFolder).forEach((file) => {
		fs.unlinkSync(path.join(destinationFolder, file));
	});

	envs.forEach((env: ENV) => {
		// eslint-disable-next-line unicorn/no-negated-condition
		if (env !== 'tokens') {
			tenants.forEach((tenant: TENANT) => {
				generateTokens(env, tenant);
			});
		} else {
			generateTokens(env);
		}
	});
	console.log('Global config tokens finished');
};
