import sade from 'sade';
import { AsyncSeriesWaterfallHook, SyncWaterfallHook } from 'tapable';

import configureCommands from './commands';
import './polyfill';
import { registerHooks } from './utils/hooks';

const app = sade('gdu').option('--debug', 'Enable debug mode');

configureCommands(app);

export default (argv: string[]) => {
	// -- SetupHooks

	// Transpilation Related Hooks
	registerHooks({
		webpackConfig: new SyncWaterfallHook(['config']),
		babelConfig: new SyncWaterfallHook(['config']),
	});

	// Server Hooks
	registerHooks({
		beforeServer: new AsyncSeriesWaterfallHook(['server']),
		afterServer: new AsyncSeriesWaterfallHook(['server']),
	});

	// TODO: Move these hooks to next js something
	// NextJS Hooks
	registerHooks({
		nextJSPrepare: new AsyncSeriesWaterfallHook(['app']),
		nextJSConfig: new SyncWaterfallHook(['config']),
	});

	app.parse(argv);
};
