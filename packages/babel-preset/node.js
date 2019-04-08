const sharedPlugins = require('./sharedPlugins');

module.exports = function autoGuruNodePreset(api, options = {}) {
	const env = api.env();
	const isDevelopment = env === 'development' || env === 'test';

	const {
		version = 'current',
		modules = 'commonjs',
		debug = isDevelopment,
		corejs = 2,
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
