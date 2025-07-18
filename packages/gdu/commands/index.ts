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
		.action(
			deferredAction(async () => {
				process.env.GDU_COMMAND = 'start';
				if (!process.env.APP_ENV) {
					process.env.APP_ENV = 'dev_au';
				}
				if (!process.env.ANALYZE) {
					process.env.ANALYZE = 'false';
				}
				if (!process.env.BABEL_DEBUG) {
					process.env.BABEL_DEBUG = 'false';
				}
				return import('./start');
			}, IS_NOT_ROOT),
		);

	// === BUILD
	app.command('build')
		.describe('Builds the target app ready for production')
		.option('-t, --tenant', 'Tenant to build the mfe for', '')
		.option('-a, --analyze', 'Analyze the bundle', false)
		.option('-p, --production', 'Production build', true)
		.action(
			deferredAction(async (opts) => {
				process.env.GDU_COMMAND = 'build';
				if (!process.env.NODE_ENV) {
					process.env.NODE_ENV =
						opts?.production === false
							? 'development'
							: 'production';
				}
				if (
					!process.env.BABEL_DEBUG ||
					process.env.BABEL_DEBU !== 'true'
				) {
					process.env.BABEL_DEBUG = 'false';
				}
				if (!process.env.ANALYZE || process.env.ANALYZE !== 'true') {
					process.env.ANALYZE =
						opts?.analyze === true ? 'true' : 'false';
				}
				return import('./build');
			}, IS_NOT_ROOT),
		);

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

	app.command('generate-mfe-list')
		.describe('Generate mfe list')
		.action(deferredAction(async () => import('./mfe-list'), IS_NOT_ROOT));

	app.command('generate-global-configs')
		.describe('Generate global configs')
		.option('-t, --tokens', 'Generate tokens files', '')
		.action(
			deferredAction(async () => import('./global-configs'), IS_NOT_ROOT),
		);
};

const NOT_READY = wrapAction(() => {
	throw new Error('No ready yet');
});

const IS_NOT_ROOT = (config) => {
	return !config?.isRoot;
};
