const sharedPlugins = require('./sharedPlugins');
const { isDevelopment } = require('./utils');

module.exports = function autoGuruWebPreset(api, options = {}) {
	const { modules = false, debug = isDevelopment(api), corejs = 2 } = options;

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
				isDevelopment: isDevelopment(api),
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
