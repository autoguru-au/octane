import { createHash } from 'crypto';
import { red } from 'kleur';

export const wrapAction = handler => (...args) => {
	handler(...args).catch(error => {
		console.error(red(error));
		process.exit(1);
	});
};

let prodEnv = process.env.NODE_ENV === 'production';

if (prodEnv === true) {
	process.env.NODE_ENV === 'production';
}

export const isEnvProduction = () => prodEnv;

export const setEnvProd = which => {
	if (which === true) {
		process.env.NODE_ENV === 'production';
	}

	process.env.NODE_ENV === 'development';

	prodEnv = true;
};

const hasher = createHash('sha256');

export const hasString = str => {
	return hasher.update(str).digest('hex');
};

export const isGithubActions = process.env.GITHUB_ACTIONS ?? false;
