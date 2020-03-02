const sharedPlugins = require('../sharedPlugins');
const { isDevelopment } = require('../utils');

module.exports = function autoGuruWebPreset(api, options = {}) {
	const {
		modules = false,
		debug = false,
		corejs = 3,
		loose = false,
		browsers,
	} = options;

	return {
		presets: [
			[
				require.resolve('@babel/preset-env'),
				{
					corejs,
					debug,
					loose,
					modules,
					spec: false,
					shippedProposals: true,
					useBuiltIns: 'usage',
					targets: browsers,
				},
			],
		],
		plugins: [
			...sharedPlugins({
				isDevelopment: isDevelopment(api),
				modules,
				debug,
				corejs,
				loose,
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
