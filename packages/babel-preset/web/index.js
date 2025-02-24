const defaultBrowsers = require('../../browserslist-config');
const sharedPlugins = require('../sharedPlugins');
const { isDevelopment, isDebugging } = require('../utils');

module.exports = function autoGuruWebPreset(api, options = {}) {
	const { modules = false, corejs = 3, browsers } = options;
	return {
		presets: [
			[
				require.resolve('@babel/preset-env'),
				{
					bugfixes: true,
					useBuiltIns: 'entry', // Changed to entry to be more restrictive
					corejs: {
						version: 3,
						proposals: false, // Disabled proposals to avoid unnecessary polyfills
					},
					modules,
					loose: false,
					targets: browsers || defaultBrowsers,
					include: [],
					exclude: ['transform-typeof-symbol'],
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
