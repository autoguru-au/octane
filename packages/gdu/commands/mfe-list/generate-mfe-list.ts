import fs from 'fs';
import * as path from 'path';
const appsDir = path.resolve('apps');

const tenantsList = [
	'au',
	'au-legacy',
	'nz',
	'global'
]
const envs = ['dev', 'uat', 'test', 'preprod', 'prod', 'shared'];

function checkTenantsEnvs(appsDir, directory) {
	const appConfig = path.resolve(appsDir, directory, '.gdu_app_config');
	const tenants = []
	for (const tenant of tenantsList) {
		const envsList = []
		for (const env of envs) {
			const tenantEnvFile = path.join(appConfig, `.env.${env}_${tenant}`);
			if (fs.existsSync(tenantEnvFile)) {
				envsList.push(env);
			}
		}
		if (envsList.length > 0) {
			tenants[tenant] = envsList ;
		}
	}
	return tenants;
}

interface OctopusConfig {
	type: string;
	octopusProjectName: string;
}

async function generateMfeLists() {
	const typeMap = {};
	const directories = fs
		.readdirSync(appsDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	for (const directory of directories) {
		const configPath = path.join(appsDir, directory, 'guru.config.js');
		if (fs.existsSync(configPath)) {
			const tenants = checkTenantsEnvs(appsDir, directory);
			// const { type, octopusProjectName } = require(configPath);
			const { type, octopusProjectName } = (await import(configPath)) as OctopusConfig;

			const mfe = {
				name: directory,
				description: octopusProjectName,
				...tenants,
			};

			if (!typeMap[type]) {
				typeMap[type] = {};
			}
			typeMap[type][directory] = mfe;
		}
	}

	//save typeMap to a json file saved under../../mfe-data/mfe-list.json
	const dirPath = path.resolve('.mfe-data');
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath);
	}
	fs.writeFileSync(
		path.join(dirPath, 'mfe-list.json'),
		JSON.stringify(typeMap, null, 2),
	);
	return typeMap;
}

// extract tenants into tenants-list.json
async function generateTenants() {
	const dirPath = path.resolve( '.mfe-data');
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath);
	}
	fs.writeFileSync(path.join(dirPath, 'tenants-list.json'), JSON.stringify(tenantsList, null, 2));
	return tenantsList;
}

export default async () => {
	await generateTenants();
	await generateMfeLists()
}
