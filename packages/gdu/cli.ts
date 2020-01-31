import sade from 'sade';
import { AsyncSeriesWaterfallHook, SyncWaterfallHook } from 'tapable';

import configureCommands from './commands';
import { registerHooks } from './utils/hooks';

const app = sade('gdu').option('--debug', 'Enable debug mode');

configureCommands(app);

export default (argv: string[]) => {
	// -- SetupHooks
	// TODO: Maybe find a better place for this?

	// Transpilation Related Hooks
	registerHooks({
		afterWebpackConfig: new SyncWaterfallHook(['config']),
		afterBabelConfig: new SyncWaterfallHook(['config']),
	});

	// Server Hooks
	registerHooks({
		beforeServer: new SyncWaterfallHook(['server']), // TODO: Maybe these can be async?
		afterServer: new SyncWaterfallHook(['server']), // TODO: Maybe these can be async?
	});

	// NextJS Hooks
	registerHooks({
		beforeNextJSPrepare: new AsyncSeriesWaterfallHook(['app']),
		afterNextJSConfig: new SyncWaterfallHook(['config']),
	});

	app.parse(argv);
};
