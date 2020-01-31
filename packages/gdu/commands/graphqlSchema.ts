import { existsSync, readFileSync } from 'fs';
import { getGraphQLConfig, GraphQLEndpoint, writeSchema } from 'graphql-config';
import { cyan, green, red } from 'kleur';
import mkdirp from 'mkdirp';
import { dirname, resolve } from 'path';

let endpoint = null;

export default async options => {
	const ROOT = process.cwd();

	const graphQLConfig = getGraphQLConfig(ROOT);

	const endpointConfig =
		graphQLConfig.config.extensions.endpoints[options.endpoint];

	if (typeof endpointConfig === 'undefined') {
		throw new TypeError(`Endpoint ${options.endpoint} doesnt exist`);
	}

	const proposedConfigFile = resolve(ROOT, graphQLConfig.config.schemaPath);

	if (existsSync(proposedConfigFile)) {
		await updateSchemaIfHasNew(proposedConfigFile, endpointConfig);
	} else {
		console.log(' > No schema found - downloading one.');

		await downloadNewSchema(proposedConfigFile, endpointConfig);
	}

	console.log(' > Schema has been checked, and is ready to use! ✅️');
};

async function updateSchemaIfHasNew(schemaPath, endpointConfig) {
	const checksum = await getSchemaChecksum(endpointConfig);

	console.log(` > Checking schema with checksum ${green(checksum)}`);

	const schemaData = readFileSync(schemaPath, 'utf8');

	const [, oldChecksum] = /^#\schecksum:\s([a-z0-9]+)/.exec(schemaData);

	if (oldChecksum !== checksum) {
		console.log(` > Found changed checksum: ${red(oldChecksum)}`);

		console.log(` > ${cyan('Downloading new schema')}`);
		await downloadNewSchema(schemaPath, endpointConfig);
	}
}

async function downloadNewSchema(schemaPath, endpointConfig) {
	const endpoint = await getSchemaEndpoint(endpointConfig);
	const checksum = await getSchemaChecksum(endpointConfig);

	mkdirp.sync(dirname(schemaPath));

	await writeSchema(schemaPath, await endpoint.resolveSchema(), {
		checksum,
		endpoint: endpoint.url,
		timestamp: new Date().toISOString(),
	});
}

function getSchemaEndpoint(endpointConfig) {
	if (endpoint === null) {
		console.log(` > Using endpoint ${green(endpointConfig.url)}`);
		endpoint = new GraphQLEndpoint(endpointConfig);

		return endpoint;
	}

	return endpoint;
}

async function getSchemaChecksum(endpointConfig) {
	const endpoint = await getSchemaEndpoint(endpointConfig);

	const {
		checksum: { value },
	} = await endpoint.getClient().request('query { checksum { value } }');

	return value.toLowerCase();
}
