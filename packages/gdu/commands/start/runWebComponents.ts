import { existsSync } from 'fs';
import { join } from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import { blue, bold, cyan, red } from 'kleur';
import dedent from 'ts-dedent';
import webpack, { Configuration } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import { makeWebComponentsWebpackConfig } from '../../config/webpack/webpack.webcomponents.config';
import { getProjectName, GuruConfig } from '../../lib/config';
import { PROJECT_ROOT } from '../../lib/roots';
import { getHooks } from '../../utils/hooks';

const getConsumerHtmlTemplate = (
	guruConfig: GuruConfig,
): string | undefined => {
	try {
		const filePath = join(guruConfig.__configPath, '/template.html');
		if (existsSync(filePath)) {
			return filePath;
		}
		// eslint-disable-next-line no-empty
	} finally {
	}

	return void 0;
};

const localhost = '0.0.0.0';
const hosts = ['localhost', localhost];
export const runWebComponents = async (guruConfig: GuruConfig, component) => {
	const hooks = getHooks();
	console.log(`${cyan('Starting dev server...')}`);

	// eslint-disable-next-line unicorn/prefer-prototype-methods
	const webpackConfig: Configuration = hooks.webpackConfig.call(
		makeWebComponentsWebpackConfig(
			guruConfig.type || 'WEB_COMPONENTS',
			true,
		),
	);

	if (!component)
		throw new Error(
			`'COMPONENT' environment variable is not defined. This is the tag name for your web component`,
		);

	const consumerHtmlTemplate = getConsumerHtmlTemplate(guruConfig);

	webpackConfig.plugins.push(
		// @ts-ignore
		new HtmlWebpackPlugin({
			template: consumerHtmlTemplate ?? 'auto',
		}),
	);
	webpackConfig.plugins.push(
		new (class HtmlWebpackPluginConfigAdditionsPlugin {
			apply(compiler) {
				compiler.hooks.make.tap('guru', (compilation) => {
					const htmlWebpackHooks = (
						HtmlWebpackPlugin as any
					).getHooks(compilation) as HtmlWebpackPlugin.Hooks;

					let thisEnvChunk;

					htmlWebpackHooks.alterAssetTags.tap('guru', (cfg) => {
						if (thisEnvChunk) {
							for (const file of thisEnvChunk.files
								.reverse()
								.filter((file) => file.endsWith('.js'))) {
								cfg.assetTags.scripts.unshift({
									tagName: 'script',
									voidTag: false,
									attributes: {
										src: `${
											compilation.options.output
												.publicPath || ''
										}${file}`,
									},
									meta: { plugin: 'html-webpack-plugin' },
								});
							}
						}

						return cfg;
					});

					//if (consumerHtmlTemplate === undefined) {
					htmlWebpackHooks.beforeEmit.tapAsync('guru', (data, cb) => {
						const segs = data.html.split('<body>');
						data.html =
							`${segs[0]}<main class='tag-wrapper'><${component} /></main>` +
							segs[1];
						cb(null, data);
					});
					//}
				});
			}
		})(),
	);

	const compiler = webpack(webpackConfig);

	let beenReadyBefore = false;
	compiler.hooks.done.tap('runner', () => {
		if (!beenReadyBefore) {
			console.log(dedent`

			You can now view ${bold(getProjectName())} in the browser.

			  Local:            ${blue(`http://${hosts[0]}:${guruConfig.port}/`)}
			  On Your Network:  ${blue(
					`http://${require('ip').address()}:${guruConfig.port}/`,
				)}

			Note that the development build is not optimized.
			To create a production build, use ${cyan('yarn build')}.

			`);

			beenReadyBefore = true;
		}
	});

	const devServer = new WebpackDevServer(
		compiler as any,
		{
			static: join(PROJECT_ROOT, 'public'),
			host: hosts[0],
			allowedHosts: hosts,
			historyApiFallback: true,
			hot: true,
			port: guruConfig.port,
		} as any,
	);

	devServer.start().catch((error) => {
		if (error) {
			console.log(red(error.message));
		}
	});
};
