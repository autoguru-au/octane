const sharedPlugins = require('./sharedPlugins');

module.exports = function autoGuruWebPreset(api, options = {}) {
	const env = api.env();

	const isDevelopment = env === 'development' || env === 'test';

	const { modules = false, debug = !isDevelopment } = options;

	return {
		presets: [
			[
				require.resolve('@babel/preset-env'),
				{
					debug,
					loose: true,
					modules,
					spec: false,
					useBuiltIns: 'usage',
					corejs: 3,
				},
			],
		],
		plugins: sharedPlugins(env),
	};
};
