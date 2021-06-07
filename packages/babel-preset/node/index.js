/* eslint-disable unicorn/prefer-module */
const sharedPlugins = require('../sharedPlugins');
const { isDevelopment } = require('../utils');

// eslint-disable-next-line unicorn/prefer-module
module.exports = function autoGuruNodePreset(api, options = {}) {
	const {
		version = 'current',
		modules = 'commonjs',
		debug = isDevelopment(api),
		corejs = 3,
	} = options;

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
					targets: { node: version },
					useBuiltIns: 'usage',
				},
			],
		],
		plugins: sharedPlugins({
			modules,
			debug,
			corejs,
		}),
	};
};
