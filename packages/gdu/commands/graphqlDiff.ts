import http from 'http';
import { join } from 'path';

import execa from 'execa';
import { loadConfig } from 'graphql-config';
import { blue, green } from 'kleur';
import { Server } from 'node-static';
import open from 'open';

import { PROJECT_ROOT } from '../lib/roots';

import graphqlSchema, { EndpointExtension } from './graphqlSchema';

export default async (options) => {
	const graphQLConfig = await loadConfig({
		rootDir: PROJECT_ROOT,
	});

	const config = graphQLConfig.getDefault();
	const compareEndpointConfig = config.extension('endpoints')[
		options.endpoint
	] as EndpointExtension | undefined;
	if (typeof compareEndpointConfig === 'undefined') {
		throw new TypeError(
			`Compare Endpoint ${options.endpoint} doesnt exist use -c flag to pass you compare endpoint name`,
		);
	}
	const path = config.schema as string;
	const folderIndex = path.lastIndexOf('/');

	const schemaPath = options.schemaPath || path;

	await graphqlSchema({
		...options,
		s: schemaPath,
		schemaPath,
	}); // Fetch feature schema

	const folderPath = path.slice(0, folderIndex + 1);
	const compareSchemaPath =
		options.compareSchemaPath ||
		`${folderPath}compare-${path.slice(folderIndex + 1, path.length)}`;
	await graphqlSchema({
		// Fetch compare schema
		...options,
		e: options.c,
		endpoint: options.compareEndpoint,
		s: compareSchemaPath,
		schemaPath: compareSchemaPath,
	}); // Fetch Schema

	execa
		.command(
			`graphql-schema-diff ${compareSchemaPath} ${schemaPath} --create-html-output`,
			{
				stdio: 'inherit',
				cwd: PROJECT_ROOT,
				localDir: PROJECT_ROOT,
				extendEnv: true,
			},
		)
		.then(
			(result) => {
				console.log(`${green('SUCCESS!')}`, result);
				console.log(
					`${green('Schemas Diff document generated under')} ${blue(
						'./schemaDiff/index.html',
					)}`,
				);

				const staticSitePath = join(PROJECT_ROOT, 'schemaDiff');
				const file = new Server(staticSitePath);
				const port = options.port || 8080;
				const url = `http://localhost:${port}`;
				http.createServer(function (request, response) {
					request
						.addListener('end', function () {
							file.serve(request, response);
						})
						.resume();
				}).listen(port);

				console.log(`View diff under ${url}`);

				open(url);
			},
			(error) => {
				throw error;
			},
		);
};
