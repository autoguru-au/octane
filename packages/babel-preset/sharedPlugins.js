module.exports = function autoGuruSharedPlugins(options) {
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

	return !options.isDevelopment
		? [...plugins, require.resolve('@babel/plugin-transform-strict-mode')]
		: plugins;
};
