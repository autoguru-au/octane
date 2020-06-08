module.exports = function autoGuruSharedPlugins() {
	return [
		[
			require.resolve('@babel/plugin-transform-strict-mode'),
			{ loose: false },
		],
		[
			require.resolve('@babel/plugin-proposal-export-default-from'),
			{ loose: false },
		],
		require.resolve('@babel/plugin-syntax-dynamic-import'),
		[
			require.resolve('@babel/plugin-proposal-class-properties'),
			{ loose: false },
		],
		[
			require.resolve('@babel/plugin-proposal-object-rest-spread'),
			{ loose: false, useBuiltIns: true },
		],
		[
			require.resolve('@babel/plugin-proposal-optional-chaining'),
			{ loose: false },
		],
		[
			require.resolve(
				'@babel/plugin-proposal-nullish-coalescing-operator',
			),
			{ loose: false },
		],
		[require.resolve('@babel/plugin-transform-spread'), { loose: false }],
		require.resolve('babel-plugin-dev-expression'),
	];
};
