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
					shippedProposals: true,
					useBuiltIns: 'usage',
				},
			],
		],
		plugins: [
			...sharedPlugins({
				isDevelopment,
				modules,
				debug,
				corejs,
			}),
			require.resolve('babel-plugin-macros'),
			[
				require.resolve('@babel/plugin-transform-runtime'),
				{
					useESModules: modules === false ? false : 'auto',
					corejs: options.corejs,
				},
			],
		].filter(Boolean),
	};
};
