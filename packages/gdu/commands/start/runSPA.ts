import { existsSync } from 'fs';
import { join } from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import { blue, bold, cyan, red, magenta } from 'kleur';
import dedent from 'ts-dedent';
import webpack, { Configuration } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import webpackConfigs from '../../config/webpack';
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
	const appEnv = process.env.APP_ENV || 'dev_au';

	const webpackConfig: Configuration = hooks.webpackConfig
		.call(
			webpackConfigs({
				env: appEnv,
				isDebug,
				standalone: guruConfig?.standalone,
			}),
		)
		.find(({ name }) => name === appEnv);

	const consumerHtmlTemplate = getConsumerHtmlTemplate(guruConfig);

	// Add HtmlWebpackPlugin with proper ES module configuration
	webpackConfig.plugins.push(
		new HtmlWebpackPlugin({
			template: consumerHtmlTemplate ?? 'auto',
			scriptLoading: 'module', // Use ES modules
			inject: 'body',
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
										type: 'module', // Set script type to module
									},
									meta: { plugin: 'html-webpack-plugin' },
								});
							}
						}

						// Ensure all scripts use type="module"
						cfg.assetTags.scripts.forEach((script) => {
							script.attributes.type = 'module';
						});

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

	// Enhanced DevServer configuration with improved HMR support for ES modules
	const devServer = new WebpackDevServer(
		{
			static: join(PROJECT_ROOT, 'public'),
			host: hosts[0],
			allowedHosts: hosts,
			historyApiFallback: true,
			hot: true, // Enable HMR
			port: guruConfig.port,
			client: {
				overlay: {
					errors: true,
					warnings: false,
				},
				progress: true,
				logging: 'info',
			},
			devMiddleware: {
				publicPath: '/',
			},
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods':
					'GET, POST, PUT, DELETE, PATCH, OPTIONS',
				'Access-Control-Allow-Headers':
					'X-Requested-With, content-type, Authorization',
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
