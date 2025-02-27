const sharedPlugins = require('@autoguru/babel-preset/sharedPlugins');
const { isDevelopment, isDebugging } = require('@autoguru/babel-preset/utils');

module.exports = function autoGuruWebDevelopmentPreset(api, options = {}) {
	const { modules = false, debug = false, corejs = 3, browsers } = options;

	return {
		presets: [
			[
				require.resolve('@babel/preset-env'),
				{
					corejs,
					debug,
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
				debug,
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
