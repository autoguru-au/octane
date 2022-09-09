import { loadConfig } from 'graphql-config';
import { GraphQLConfigExtension } from 'graphql-config/extension';
import fetch from 'node-fetch';

import { writeFileAsync } from '../lib/io';
import { CALLING_WORKSPACE_ROOT } from '../lib/roots';

export interface EndpointExtension extends GraphQLConfigExtension {
	url: string;
	method: 'GET' | 'POST';
	headers: Record<string, string>;
	schemaNormaliserPatterns: Array<{
		pattern: string;
		flags?: string;
		replacer: string;
	}>;
}

const normalise = (
	patterns: EndpointExtension['schemaNormaliserPatterns'],
	rawSchema: string,
) => {
	if (typeof rawSchema !== 'string') return rawSchema;
	const schema = rawSchema.replaceAll('`', "'");
	return Array.isArray(patterns)
		? patterns.reduce(
				(schemaStr, normaliser) =>
					schemaStr.replace(
						new RegExp(normaliser.pattern, normaliser.flags),
						normaliser.replacer,
					),
				schema,
		  )
		: schema;
};

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
		await writeFileAsync(
			options.schemaPath || (config.schema as string),
			normalise(
				endpointConfig.schemaNormaliserPatterns,
				await response.text(),
			),
		);
	}

	console.log('~> Schema has been checked, and is ready to use! ✅️');
};
