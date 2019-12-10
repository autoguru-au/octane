module.exports = function autoGuruSharedPlugins(options) {
	return [
		require.resolve('@babel/plugin-transform-strict-mode'),
		require.resolve('@babel/plugin-proposal-export-default-from'),
		require.resolve('@babel/plugin-syntax-dynamic-import'),
		require.resolve('@babel/plugin-proposal-optional-chaining'),
		[
			require.resolve('@babel/plugin-proposal-class-properties'),
			{ loose: options.loose },
		],
		[
			require.resolve('@babel/plugin-proposal-object-rest-spread'),
			{ loose: options.loose, useBuiltIns: true },
		],
		[
			require.resolve('@babel/plugin-transform-spread'),
			{ loose: options.loose },
		],
		require.resolve('babel-plugin-dev-expression'),
	];
};
