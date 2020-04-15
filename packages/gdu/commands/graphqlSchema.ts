import { UrlLoader } from '@graphql-toolkit/url-loader';
import { readFileSync } from 'fs';
import { GraphQLSchema, printSchema } from 'graphql';
import { GraphQLProjectConfig, loadConfig } from 'graphql-config';
import { GraphQLConfigExtension } from 'graphql-config/extension';
import { GraphQLClient } from 'graphql-request';
import { cyan, green, red } from 'kleur';
import { resolve } from 'path';

import { writeFileAsync } from '../lib/io';
import { CALLING_WORKSPACE_ROOT } from '../lib/roots';

interface EndpointExtension extends GraphQLConfigExtension {
	url: string;
	method: string;
	headers: Record<string, string>;
}

const debug = require('debug')('gdu:commands:graphqlSchema');

export default async options => {

	const graphQLConfig = await loadConfig({
		rootDir: CALLING_WORKSPACE_ROOT,
	});

	const config = graphQLConfig.getDefault();

	const endpointConfig = config.extension('endpoints')[options.endpoint] as EndpointExtension | undefined;

	if (typeof endpointConfig === 'undefined') {
		throw new TypeError(`Endpoint ${options.endpoint} doesnt exist`);
	}

	const schemaString = await loadLocalSchema(config);

	if (schemaString) {
		await updateSchemaIfHasNew(config, endpointConfig);
	} else {
		console.log(' > No schema found - downloading one.');

		await downloadNewSchema(config, endpointConfig);
	}

	console.log(' > Schema has been checked, and is ready to use! ✅️');
};

async function loadLocalSchema(config: GraphQLProjectConfig): Promise<string | null> {
	let schemaString = null;

	try {
		schemaString = readFileSync(resolve(config.dirpath, config.schema as string), 'utf8');
	} catch (error) {
		debug(error);
	}

	return schemaString;
}

async function getRemoteSchema(_config: GraphQLProjectConfig, endpointConfig: EndpointExtension): Promise<GraphQLSchema> {
	return (await new UrlLoader().load(endpointConfig.url, {
		method: endpointConfig.method,
		headers: endpointConfig.headers,
	})).schema;
}

async function updateSchemaIfHasNew(config: GraphQLProjectConfig, endpointConfig: EndpointExtension) {
	const checksum = await getSchemaChecksum(config, endpointConfig);
	const schemaRegex = /^#\schecksum:\s([a-z0-9]+)/;

	console.log(` > Checking schema with remote checksum ${green(checksum)}`);

	const schemaData = await loadLocalSchema(config);

	if (schemaRegex.test(schemaData)) {

		const [, oldChecksum] = schemaRegex.exec(schemaData);

		if (oldChecksum !== checksum) {
			console.log(` > Found changed checksum: ${red(oldChecksum)}`);

			console.log(` > ${cyan('Downloading new schema')}`);
			await downloadNewSchema(config, endpointConfig);
		}
	} else {
		console.log(' > No checksum found');
		console.log(` > ${cyan('Downloading new schema')}`);
		await downloadNewSchema(config, endpointConfig);
	}
}

async function downloadNewSchema(config: GraphQLProjectConfig, endpointConfig: EndpointExtension) {
	const remoteSchema = await getRemoteSchema(config, endpointConfig);
	const checksum = await getSchemaChecksum(config, endpointConfig);

	await writeFileAsync(config.schema as string, `# checksum: ${checksum}\n\n${printSchema(remoteSchema)}`);
}

async function getSchemaChecksum(_config: GraphQLProjectConfig, endpointConfig: EndpointExtension): Promise<string> {
	const cl = new GraphQLClient(endpointConfig.url, {
		headers: endpointConfig.headers,
		method: endpointConfig.method,
	});

	const {
		checksum: { value },
	} = await cl.request('query { checksum { value } }');

	return value.toLowerCase();
}
