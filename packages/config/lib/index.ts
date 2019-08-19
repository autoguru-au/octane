import { readFileSync } from 'fs';
import { sync as glob } from 'glob';
import { safeLoad } from 'js-yaml';
import { join, parse, resolve } from 'path';

export const getConfig = () => {

	console.log(process.cwd());

};

export const getConfigFor = async (env: string, config?: {
	cwd: string;
} = { cwd: process.cwd() }) => {

	const configFiles = getConfigFiles(config.cwd);

	const base = configFiles.find(item => item.name === 'base');
	const envs = configFiles.filter(item => item.name !== 'base');


	console.log(envs
		.map(item => ({
			...item,
			merged: JSON.stringify(deepMerge(base.json, item.json)),
		})));

};


const getConfigFiles = (cwd: string) => {

	const configLocation = join(cwd, 'config');

	return glob('**/*.yml', {
		cwd: configLocation,
	})
		.reduce((result, item) => {
			return [
				...result,
				{
					name: parse(item).name,
					location: resolve(configLocation, item),
					body: readFileSync(join(configLocation, item), 'utf8'),
					get json() {
						return safeLoad(this.body);
					},
				},
			];
		}, []);
};

function deepMerge(...sources) {
	let acc = {};
	for (const source of sources) {
		if (Array.isArray(source)) {
			if (!Array.isArray(acc)) {
				acc = [];
			}

			acc = [...acc, ...source];
		} else if (source instanceof Object) {
			for (let [key, value] of Object.entries(source)) {
				if (value instanceof Object && key in acc) {
					value = deepMerge(acc[key], value);
				}

				acc = { ...acc, [key]: value };
			}
		}
	}

	return acc;
}
