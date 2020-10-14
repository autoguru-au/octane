import { createHash } from 'crypto';
import { red } from 'kleur';

export const wrapAction = (handler) => (...args) => {
	handler(...args).catch((error) => {
		console.error(red('An error occurred during command running.'));
		console.error(error);
		process.exit(1);
	});
};

let prodEnv = process.env.NODE_ENV === 'production';

export const isEnvProduction = () => prodEnv;

export const setEnvProd = (which) => {
	if (which === true) {
		// @ts-ignore
		process.env.NODE_ENV = 'production';
	}

	// @ts-ignore
	process.env.NODE_ENV = 'development';

	prodEnv = true;
};

export const hashString = (str) => {
	const hasher = createHash('sha256');
	return hasher.update(str).digest('hex');
};

export const isGithubActions = process.env.GITHUB_ACTIONS ?? false;
