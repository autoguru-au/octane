module.exports = function autoGuruSharedPlugins(env, options = {}) {
	const isDevelopment = env === 'development' || env === 'test';
	const { useESModules = true } = options;

	const plugins = [
		[
			require.resolve('@babel/plugin-proposal-class-properties'),
			{ loose: true },
		],
		require.resolve('@babel/plugin-proposal-export-default-from'),
		require.resolve('@babel/plugin-syntax-dynamic-import'),
		[
			require.resolve('@babel/plugin-proposal-object-rest-spread'),
			{ loose: true, useBuiltIns: true },
		],
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
