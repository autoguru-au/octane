import { Sade } from 'sade';

import { getGuruConfig, GuruConfig } from '../lib/config';
import { wrapAction } from '../lib/misc';
import { bindHooks } from '../utils/hooks';

const deferredAction = (
	importee,
	shouldRun?: (config: GuruConfig | null) => boolean,
) =>
	wrapAction((...args) => {
		if (typeof shouldRun === 'function') {
			const guruConfig = getGuruConfig();

			if (shouldRun(guruConfig) === false)
				throw new Error('Sorry this command is not supported');
		}

		bindHooks(); // TODO: Is this too soon?

		return importee().then((item) => {
			return item.default(...args);
		});
	});

export default (app: Sade) => {
	// This sets up the cli options, and commands
	// which scopes the requires inside the actions, such that a `gdu start`
	// won't then also load the code needed to power `gdu build` for instance

	// === SCAFFOLD
	app.command('scaffold <type> <app_name>')
		.describe('Creates a new gdu project')
		.example('scaffold ssr new-app')
		.example('scaffold spa new-app')
		.action(deferredAction(async () => import('./scaffold')));

	// === CONFIGURE
	app.command('configure')
		.describe(
			'Sets up the gdu project, creating tsconfig gitignore files etc..',
		)
		.action(deferredAction(async () => import('./configure'), IS_NOT_ROOT));

	// === START
	app.command('start')
		.describe('Starts a development server')
		.option('-p, --port', 'Specify a port to start at', 8080)
		.option('-c, --component', 'Specify the web component to start', 8080)
		.option(
			'-d, --debug',
			'Enables debug ui when available in the mfe app.',
			false,
		)
		.example('start -p 80')
		.action(deferredAction(async () => import('./start'), IS_NOT_ROOT));

	// === BROWSERS
	app.command('generateBrowsers')
		.describe('Builds a regex of supported browser user agents')
		.action(
			deferredAction(
				async () => import('./generateBrowsers'),
				IS_NOT_ROOT,
			),
		);

	// === BUILD
	app.command('build')
		.describe('Builds the target app ready for production')
		.option('-t, --tenant', 'Tenant to build the mfe for', '')
		.action(deferredAction(async () => import('./build'), IS_NOT_ROOT));

	// === FORMAT
	app.command('format')
		.describe('Runs prettier over the current tree')
		.option('--write', 'Write files', 'true')
		.option('-l, --list-different', 'Differences in files', 'false')
		.action(deferredAction(async () => import('./format'), IS_NOT_ROOT));

	app.command('graphql-schema')
		.option(
			'-e, --endpoint',
			'The endpoint name to retrieve the schema from.',
		)
		.option('-s, --schemaPath', 'The path to write schema file to.')
		.example('graphql-schema')
		.action(deferredAction(async () => import('./graphqlSchema')));

	app.command('graphql-doc')
		.option(
			'-e, --endpoint',
			'The endpoint name to retrieve the schema from.',
		)
		.option('-s, --schemaPath', 'The path to write schema file to.')
		.option('-p, --port', 'Port number to serve the docs over.')
		.example('graphql-schema')
		.action(deferredAction(async () => import('./graphqlDoc')));

	app.command('graphql-diff')
		.option(
			'-e, --endpoint',
			'The endpoint name to retrieve the schema from.',
		)
		.option('-s, --schemaPath', 'The path to write schema file to.')
		.option(
			'-c, --compareEndpoint',
			'The endpoint name to retrieve compare schema from.',
		)
		.option('-cs, --compareSchemaPath', 'The path to write schema file to.')
		.option('-p, --port', 'Port number to serve the diff over.')
		.example('graphql-diff')
		.action(deferredAction(async () => import('./graphqlDiff')));

	app.command('test').action(NOT_READY); // CMD: test
	app.command('lint')
		.describe('Check the target app for linting errors')
		.action(deferredAction(async () => import('./lint'), IS_NOT_ROOT));

	app.command('gh-actions')
		.describe('A command to create GitHub actions things')
		.action(deferredAction(async () => import('./gh-actions')));
};

const NOT_READY = wrapAction(() => {
	throw new Error('No ready yet');
});

const IS_NOT_ROOT = (config) => {
	return !config?.isRoot;
};
