const { transformAsync } = require('@babel/core');
const BabelPluginReactCompiler = require('babel-plugin-react-compiler');

const defaultBabelParsePlugins = ['jsx', 'typescript'];

/**
 * Custom webpack loader for React Compiler
 * Based on react-compiler-webpack but using official babel-plugin-react-compiler
 * Includes critical fix for React issue #29120 (jsescOption: { minimal: true })
 */
async function reactCompilerLoader(input, _inputSourceMap) {
	const callback = this.async();

	try {
		const { babelTransFormOpt, ...reactCompilerConfig } = this.getOptions();

		const result = await transformAsync(input, {
			sourceFileName: this.resourcePath,
			filename: this.resourcePath,
			cloneInputAst: false,
			generatorOpts: {
				...babelTransFormOpt?.generatorOpts,
				// Critical fix for React Compiler with webpack
				// https://github.com/facebook/react/issues/29120
				jsescOption: {
					minimal: true,
					...babelTransFormOpt?.generatorOpts?.jsescOption,
				},
			},
			// User configured babel options
			...babelTransFormOpt,
			// Override with React Compiler plugin
			plugins: [
				[BabelPluginReactCompiler, reactCompilerConfig],
				...(babelTransFormOpt?.plugins || []),
			],
			// Override parser options
			parserOpts: {
				...babelTransFormOpt?.parserOpts,
				plugins: [
					...(babelTransFormOpt?.parserOpts?.plugins || []),
					...defaultBabelParsePlugins,
				],
			},
			ast: false,
			sourceMaps: true,
			configFile: false,
			babelrc: false,
		});

		if (!result) {
			throw new TypeError(
				'babel.transformAsync with react compiler plugin returns null',
			);
		}

		const { code, map } = result;
		callback(null, code ?? undefined, map ?? undefined);
	} catch (error) {
		callback(error);
	}
}

module.exports = reactCompilerLoader;
