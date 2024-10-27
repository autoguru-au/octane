import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';

import { getTokens } from '../../lib/globalConfigs';

const envs = ['uat', 'preprod', 'dev', 'prod', 'test', 'tokens'];
const tenants = ['au', 'nz', 'au-legacy'];
type ENV = (typeof envs)[number];
type TENANT = (typeof tenants)[number] ;

export default async () => {
	console.log('Global config tenants started');
	const TOKENS = await getTokens();

	const mfeListFile = path.resolve(
		process.cwd(),
		'.mfe-data',
		'mfe-list.json',
	);
	const mfeList = JSON.parse(fs.readFileSync(mfeListFile, 'utf-8'));
	let mfeProjects = [];

	for (const category in mfeList) {
		const categoryKeys = Object.keys(mfeList[category]);
		mfeProjects = mfeProjects.concat(categoryKeys);
	}

	const destinationFolder = path.join(
		process.cwd(),
		'.mfe-data',
		'app-configs',
	);

	const copyTokens = (mfe) => {
		const prodFile = path.join(
			process.cwd(),
			'apps',
			mfe,
			'.gdu_app_config',
			'.env.prod',
		);
		if (fs.existsSync(prodFile)) {
			const tokensFile = path.join(
				process.cwd(),
				'apps',
				mfe,
				'.gdu_app_config',
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
		}
	};

// force delete destination folder if it exists
	if (fs.existsSync(destinationFolder)) {
		fs.rmSync(destinationFolder, { recursive: true });
	}
// create destination folder
	if (!fs.existsSync(destinationFolder)) {
		fs.mkdirSync(destinationFolder, { recursive: true });
	}
	const getEnvFile = (mfe, env: ENV, tenant?: TENANT) =>
		path.join(
			process.cwd(),
			'apps',
			mfe,
			'.gdu_app_config',
			tenant ? `.env.${env}_${tenant}` : `.env.${env}`,
		);

	const generateTokens = (envFile, mfe, env: ENV, tenant?: TENANT) => {
		const fileStats = fs.statSync(envFile);
		const dirPathMfeApp = path.join(destinationFolder, `${mfe}`);
		if (!fs.existsSync(dirPathMfeApp)) {
			fs.mkdirSync(dirPathMfeApp);
		}
		let data = '';

		// Check if the file is empty
		if (fileStats.size > 0) {
			dotenv.config({ path: envFile, override: true });

			const fileContent = fs.readFileSync(envFile, 'utf8');
			const FILTERED_TOKENS = Object.keys(TOKENS).reduce((acc, key) => {
				if (fileContent.includes(key)) {
					acc[key] = process.env[key];
				}
				return acc;
			}, {});

			data = JSON.stringify(FILTERED_TOKENS, null, 2);
		}

		fs.writeFileSync(
			path.join(
				dirPathMfeApp,
				tenant ? `${env}_${tenant}.json` : `${env}.json`,
			),
			data,
		);
	};

	mfeProjects.forEach((mfe) => {
		envs.forEach((env) => {
			if (env === 'tokens') {
				const envFile = getEnvFile(mfe, env);
				copyTokens(mfe);
				if (fs.existsSync(envFile)) {
					generateTokens(envFile, mfe, env);
				}
			}
			tenants.forEach((tenant) => {
				const envFile = getEnvFile(mfe, env, tenant);
				if (fs.existsSync(envFile)) {
					generateTokens(envFile, mfe, env, tenant);
				}
			});
		});
	});
	console.log('Global config tokens finished');

}
