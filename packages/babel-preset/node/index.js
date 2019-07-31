const sharedPlugins = require('../sharedPlugins');
const { isDevelopment } = require('../utils');

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
					loose: true,
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
