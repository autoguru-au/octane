const sharedPlugins = require('../sharedPlugins');
const { isDevelopment, isDebugging } = require('../utils');

module.exports = function autoGuruWebPreset(api, options = {}) {
	const { modules = false, corejs = 3, browsers } = options;
	return {
		presets: [
			[
				require.resolve('@babel/preset-env'),
				{
					corejs,
					loose: false,
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
				isDebugging: isDebugging(api),
				modules,
				corejs,
				loose: false,
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
