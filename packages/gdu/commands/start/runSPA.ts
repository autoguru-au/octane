import { RuntimeConfigsPlugin } from 'configs-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { blue, bold, cyan, red } from 'kleur';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import dedent from 'ts-dedent';
import webpack, { Configuration } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import { makeWebpackConfig } from '../../config/webpack/webpack.config';
import { getProjectName, GuruConfig } from '../../lib/config';
import { PROJECT_ROOT } from '../../lib/roots';
import { getHooks } from '../../utils/hooks';
/* eslint-disable unicorn/prefer-module */
const getConsumerHtmlTemplate = (
	guruConfig: GuruConfig,
): string | undefined => {
	try {
		const filePath = join(guruConfig.__configPath, '/template.html');
		if (existsSync(filePath)) {
			return filePath;
		}
	} finally {
	}

	// @ts-ignore
	return;
};

const localhost = '0.0.0.0';
const hosts = ['localhost', localhost];
export const runSPA = async (
	guruConfig: GuruConfig,
	environmentName: string,
) => {
	const hooks = getHooks();
	console.log(`${cyan('Starting dev server...')}`);

	// eslint-disable-next-line unicorn/prefer-prototype-methods
	const webpackConfig: Configuration = hooks.webpackConfig.call(
		makeWebpackConfig({
			isDevServer: true,
		}),
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

					RuntimeConfigsPlugin.getHooks(compilation).configChunks.tap(
						'guru',
						(configs, configChunks) => {
							const idx = configs.findIndex(
								(item) => item.name === environmentName,
							);
							thisEnvChunk = configChunks[idx];
						},
					);

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
								});
							}
						}

						return cfg;
					});

					if (consumerHtmlTemplate === undefined) {
						htmlWebpackHooks.beforeEmit.tapAsync(
							'guru',
							(data, cb) => {
								const segs = data.html.split('<body>');
								data.html =
									`${segs[0]}<div id='app'></div>` + segs[1];
								cb(null, data);
							},
						);
					}
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

	const devServer = new WebpackDevServer(compiler, {
		contentBase: join(PROJECT_ROOT, 'public'),
		publicPath: '/',
		host: hosts[0],
		allowedHosts: hosts,
		overlay: true,
		stats: 'errors-only',
		serveIndex: false,
		historyApiFallback: true,
		hot: true,
		inline: true,
		watchOptions: {
			aggregateTimeout: 300,
			poll: 1000,
		},
	});

	devServer.listen(guruConfig.port, localhost, (err) => {
		if (err) {
			console.log(red(err));
		}
	});
};
