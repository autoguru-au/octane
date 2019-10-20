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
		require.resolve('babel-plugin-dev-expression'),
		require.resolve('@babel/plugin-proposal-optional-chaining'),
	];

	return options.isDevelopment
		? plugins
		: [...plugins, require.resolve('@babel/plugin-transform-strict-mode')];
};
