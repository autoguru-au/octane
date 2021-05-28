import { loadConfig } from 'graphql-config';
import { GraphQLConfigExtension } from 'graphql-config/extension';
import fetch from 'node-fetch';

import { writeFileAsync } from '../lib/io';
import { CALLING_WORKSPACE_ROOT } from '../lib/roots';

interface EndpointExtension extends GraphQLConfigExtension {
	url: string;
	method: 'GET' | 'POST';
	headers: Record<string, string>;
}

export default async (options) => {
	const graphQLConfig = await loadConfig({
		rootDir: CALLING_WORKSPACE_ROOT,
	});

	const config = graphQLConfig.getDefault();

	const endpointConfig = config.extension('endpoints')[options.endpoint] as
		| EndpointExtension
		| undefined;

	if (typeof endpointConfig === 'undefined') {
		throw new TypeError(`Endpoint ${options.endpoint} doesnt exist`);
	}

	const response = await fetch(endpointConfig.url, {
		method: endpointConfig.method,
		headers: endpointConfig.headers,
	});

	if (response?.ok || response?.body) {
		await writeFileAsync(config.schema as string, await response.text());
	}

	console.log('~> Schema has been checked, and is ready to use! ✅️');
};
