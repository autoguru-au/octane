import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';

import { getTokens } from '../../lib/globalConfigs';

const envs = ['uat', 'preprod', 'dev', 'prod', 'test', 'tokens', 'shared'];
const tenants = ['au', 'nz', 'au-legacy', 'global'];
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
// TODO: Add this feautre back after AUL retirement is complete.
	//if (fs.existsSync(destinationFolder)) {
	//	fs.rmSync(destinationFolder, { recursive: true });
	//}
// create destination folder
	if (!fs.existsSync(destinationFolder)) {
		fs.mkdirSync(destinationFolder, { recursive: true });
	}

	const getEnvFiles = (mfe, env: ENV, tenant?: TENANT) => {
		path.join(
			process.cwd(),
			'apps',
			mfe,
			'.gdu_app_config',
			tenant ? `.env.${env}_${tenant}` : `.env.${env}`,
		);

		const locationFolder = path.join(
			process.cwd(),
			'apps',
			mfe,
			'.gdu_app_config',
		);

		const defaultEnvFile = path.join(locationFolder, `.env.defaults`);
		const envFile = path.join(locationFolder, tenant ? `.env.${env}_${tenant}` : `.env.${env}`);

		return [fs.existsSync(defaultEnvFile)?defaultEnvFile:null, envFile];
	}

	const generateTokens = (envFiles: string[], mfe, env: ENV, tenant?: TENANT) => {
		if(!Array.isArray(envFiles)) {
			throw new TypeError('envFile should be an array');
		}
		const fileStats = fs.statSync(envFiles[1]);// if the config file is empty then also ignore the defaults
		const dirPathMfeApp = path.join(destinationFolder, `${mfe}`);
		const filteredEnvFiles = envFiles.filter(Boolean)
		if (!fs.existsSync(dirPathMfeApp)) {
			fs.mkdirSync(dirPathMfeApp);
		}

		// Check if the file is empty
		if (fileStats.size > 0) {
			dotenv.config({ path: filteredEnvFiles, override: true });

			const fileContent = filteredEnvFiles.reduce(
				(acc, envFile) => acc + fs.readFileSync(envFile, 'utf-8'),
				'',
			);
			const FILTERED_TOKENS = Object.keys(TOKENS).reduce((acc, key) => {
				if (fileContent.includes(key)) {
					acc[key] = process.env[key];
				}
				return acc;
			}, {});
			fs.writeFileSync(
				path.join(
					dirPathMfeApp,
					tenant ? `${env}_${tenant}.json` : `${env}.json`,
				),
				JSON.stringify(FILTERED_TOKENS, null, 2),
			);
		}
	};


	mfeProjects.forEach((mfe) => {
		envs.forEach((env) => {
			if (env === 'tokens') {
				const envFiles = getEnvFiles(mfe, env);
				copyTokens(mfe);
				if (fs.existsSync(envFiles[1])) {
					generateTokens(envFiles, mfe, env);
				}
			}
			tenants.forEach((tenant) => {
				const envFiles = getEnvFiles(mfe, env, tenant);
				if (fs.existsSync(envFiles[1])) {
					generateTokens(envFiles, mfe, env, tenant);
				}
			});
		});
	});

	console.log('Global config tokens finished');
}
