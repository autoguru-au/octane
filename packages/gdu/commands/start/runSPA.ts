import { existsSync } from 'fs';
import { join } from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import { blue, bold, cyan, red, magenta } from 'kleur';
import dedent from 'ts-dedent';
import webpack, { Configuration } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import buildConfigs from '../../config/webpack';
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
export const runSPA = async (guruConfig: GuruConfig, isDebug) => {
	const hooks = getHooks();
	console.log(
		`${cyan('Starting dev server...')}${
			isDebug ? magenta(' DEBUG MODE') : ''
		}`,
	);
	const appEnv = process.env.APP_ENV;
	const withBabelDebug = process.env.BABEL_DEBUG === 'true';
	console.log(
		`${cyan(`Starting SPA on ${appEnv} ...`)}${withBabelDebug ? magenta(' BABEL DEBUG MODE') : ''}`,
	);
	const webpackConfig: Configuration = hooks.webpackConfig
		.call(
			buildConfigs({
				env: appEnv,
				isDebug,
				standalone: true, // All MFE run as standalone in development mode
				analyze: false,
				withBabelDebug,
			}),
		)

		.find(({ name }) => name === appEnv);

	const consumerHtmlTemplate = getConsumerHtmlTemplate(guruConfig);

	webpackConfig.plugins.push(
		new HtmlWebpackPlugin({
			template: consumerHtmlTemplate ?? 'auto',
			scriptLoading: 'module',
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

	const devServer = new WebpackDevServer(
		{
			static: join(PROJECT_ROOT, 'public'),
			host: hosts[0],
			allowedHosts: hosts,
			historyApiFallback: true,
			hot: 'only',
			liveReload: false,
			client: {
				overlay: true,
				progress: true,
				webSocketTransport: 'ws',
			},
			webSocketServer: 'ws',
			port: guruConfig.port,
			devMiddleware: {
				publicPath: '/',
				writeToDisk: false,
			},
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		},
		compiler,
	);

	devServer.start().catch((error) => {
		if (error) {
			console.log(red(error.message));
		}
	});
};
