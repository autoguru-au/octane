const sharedPlugins = require('./sharedPlugins');

module.exports = function autoGuruWebPreset(api, options = {}) {
	const env = api.env();

	const isDevelopment = env === 'development' || env === 'test';

	const { modules = false, debug = !isDevelopment, corejs = 2 } = options;

	return {
		presets: [
			[
				require.resolve('@babel/preset-env'),
				{
					corejs,
					debug,
					loose: true,
					modules,
					spec: false,
					useBuiltIns: 'usage',
				},
			],
		],
		plugins: sharedPlugins(env),
	};
};
