module.exports = function autoGuruSharedPlugins(env, options = {}) {
	const isDevelopment = env === 'development' || env === 'test';
	const { useESModules = true } = options;

	const plugins = [
		require.resolve('@babel/plugin-syntax-dynamic-import'),
		require.resolve('@babel/plugin-proposal-class-properties'),
	];

	return !isDevelopment
		? [
				...plugins,
				require.resolve('@babel/plugin-transform-strict-mode'),
				[
					require.resolve('@babel/plugin-transform-runtime'),
					{
						useESModules,
					},
				],
		  ]
		: plugins;
};
