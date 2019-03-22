const sharedPlugins = require('./sharedPlugins');

module.exports = function autoGuruNodePreset(api, options = {}) {
	const env = api.env();
	const isDevelopment = env === 'development' || env === 'test';

	const {
		version = 'current',
		modules = 'commonjs',
		debug = isDevelopment,
	} = options;

	return {
		presets: [
			[
				require.resolve('@babel/preset-env'),
				{
					debug,
					loose: true,
					modules,
					spec: false,
					targets: { node: version },
					useBuiltIns: 'entry',
					corejs: 2,
				},
			],
		],
		plugins: sharedPlugins(env, {
			useESModules: false,
		}),
	};
};
