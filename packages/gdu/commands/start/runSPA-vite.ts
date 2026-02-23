import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { blue, bold, cyan, green, magenta } from 'kleur';
import dedent from 'ts-dedent';

import { guruConfigCjsPlugin } from '../../config/vite/plugins/guruConfigCjs';
import { relayPlugin } from '../../config/vite/plugins/relay';
import type {
	InlineConfig,
	ViteDevServer,
	VitePlugin,
} from '../../config/vite/types';
import { baseViteOptions } from '../../config/vite/vite.config';
import { getProjectName, GuruConfig } from '../../lib/config';
import {
	CALLING_WORKSPACE_ROOT,
	GDU_ROOT,
	PROJECT_ROOT,
} from '../../lib/roots';

const getConsumerHtmlTemplate = (
	guruConfig: GuruConfig,
): string | undefined => {
	const filePath = join(guruConfig.__configPath, '/template.html');
	if (existsSync(filePath)) {
		return filePath;
	}
	return undefined;
};

const gduEntryPath = join(GDU_ROOT, 'entry');

function relayCjsToEsmPlugin(): VitePlugin {
	return {
		name: 'gdu-relay-cjs-to-esm',
		transform(code, id) {
			if (!id.includes('__generated__') || !id.endsWith('.graphql.ts'))
				return null;

			const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
			let match: RegExpExecArray | null;
			const imports: Array<{ placeholder: string; specifier: string }> =
				[];
			let idx = 0;
			while ((match = requireRegex.exec(code)) !== null) {
				const placeholder = `__relay_require_${idx++}__`;
				imports.push({ placeholder, specifier: match[1] });
			}

			if (imports.length === 0) return null;

			let transformed = code;
			for (const { placeholder, specifier } of imports) {
				transformed = transformed.replace(
					`require('${specifier}')`,
					placeholder,
				);
				transformed = transformed.replace(
					`require("${specifier}")`,
					placeholder,
				);
			}

			const importStatements = imports
				.map(
					({ placeholder, specifier }) =>
						`import ${placeholder} from '${specifier}';`,
				)
				.join('\n');

			transformed = importStatements + '\n' + transformed;

			return { code: transformed, map: null };
		},
	};
}

function spaHtmlPlugin(guruConfig: GuruConfig): VitePlugin {
	const entryPath = join(gduEntryPath, 'spa', 'client.js');
	const templatePath = getConsumerHtmlTemplate(guruConfig);

	let baseHtml: string;

	if (templatePath) {
		baseHtml = readFileSync(templatePath, 'utf8');
		if (!baseHtml.includes(entryPath)) {
			baseHtml = baseHtml.replace(
				'</body>',
				`<script type="module" src="/@fs/${entryPath}"></script>\n</body>`,
			);
		}
		if (!baseHtml.includes("id='app'") && !baseHtml.includes('id="app"')) {
			baseHtml = baseHtml.replace(
				'<body>',
				'<body>\n<div id="app"></div>',
			);
		}
	} else {
		baseHtml = [
			'<!DOCTYPE html>',
			'<html>',
			'<head>',
			'  <meta charset="utf-8" />',
			'  <meta name="viewport" content="width=device-width, initial-scale=1" />',
			'</head>',
			'<body>',
			'  <div id="app"></div>',
			`  <script type="module" src="/@fs/${entryPath}"></script>`,
			'</body>',
			'</html>',
		].join('\n');
	}

	return {
		name: 'gdu-spa-html',
		configureServer(server) {
			// Returned function runs after Vite's internal middlewares,
			// acting as SPA fallback for HTML requests.
			return () => {
				server.middlewares.use((req, res, next) => {
					const url = req.url || '/';
					const isHtmlRequest =
						req.headers?.accept?.includes('text/html') &&
						req.method === 'GET';

					if (!isHtmlRequest) {
						next();
						return;
					}

					server
						.transformIndexHtml(url, baseHtml)
						.then((html) => {
							res.setHeader('Content-Type', 'text/html');
							res.statusCode = 200;
							res.end(html);
						})
						.catch((error) => {
							console.error('HTML transform error:', error);
							next(error);
						});
				});
			};
		},
	};
}

export const runSPAVite = async (guruConfig: GuruConfig, isDebug: boolean) => {
	console.log(
		`${cyan('Starting Vite dev server...')}${
			isDebug ? magenta(' DEBUG MODE') : ''
		}`,
	);

	if (typeof guruConfig.tap === 'function') {
		console.warn(
			'Warning: tap() hooks are not supported with Vite bundler. ' +
				'Custom webpack configuration in guru.config.js will not be applied.',
		);
	}

	const v8 = require('v8');
	const heapStats = v8.getHeapStatistics();
	const heapLimitMB = Math.round(heapStats.heap_size_limit / 1024 / 1024);
	if (heapLimitMB < 6144) {
		console.warn(
			`${bold('Warning:')} Node heap limit is ${heapLimitMB}MB. ` +
				`For large monorepos, set ${cyan('NODE_OPTIONS="--max-old-space-size=8192"')} to avoid OOM crashes.`,
		);
	}

	const appEnv = process.env.APP_ENV || 'dev_au';

	// Reuse the shared Vite base options (aliases, env defines, etc.)
	// and override production-specific settings for dev mode.
	const base = baseViteOptions({
		buildEnv: appEnv,
		isMultiEnv: false,
		standalone: guruConfig?.standalone,
	}) as Record<string, any>;

	const { createServer } = require('vite') as {
		createServer: (config: InlineConfig) => Promise<ViteDevServer>;
	};

	// Load Vite-dependent plugins at runtime to avoid tsc compilation errors.
	let vanillaExtractPlugin: (() => unknown) | undefined;
	try {
		vanillaExtractPlugin =
			require('@vanilla-extract/vite-plugin').vanillaExtractPlugin;
	} catch {
		// Vanilla Extract plugin not available — .css.ts files will fail at runtime.
	}

	// Enable Relay graphql transform if the centralised artifact directory exists.
	// The transform only affects files containing graphql tagged templates so it
	// is safe to enable unconditionally when the monorepo has Relay artifacts.
	let relayTransformPlugin: VitePlugin | undefined;
	if (CALLING_WORKSPACE_ROOT) {
		const artifactDir = join(
			CALLING_WORKSPACE_ROOT,
			'packages',
			'relay',
			'__generated__',
		);
		if (existsSync(artifactDir)) {
			console.log(green('Relay graphql transform enabled'));
			relayTransformPlugin = relayPlugin(artifactDir);
		}
	}

	const server = await createServer({
		root: PROJECT_ROOT,

		resolve: base.resolve,

		define: {
			...base.define,
			'process.env.NODE_ENV': JSON.stringify('development'),
			__DEV__: JSON.stringify(true),
			__DEBUG__: JSON.stringify(!!isDebug),
		},

		css: {
			devSourcemap: true,
		},

		// Use esbuild's automatic JSX runtime (lighter than @vitejs/plugin-react
		// which uses Babel and causes OOM in large monorepos).
		esbuild: {
			...base.esbuild,
			// Remove production-only console stripping for dev mode.
			pure: undefined,
		},

		server: {
			port: guruConfig.port,
			strictPort: true,
			host: '0.0.0.0',
			cors: true,
			hmr: {
				overlay: true,
			},
			warmup: {
				clientFiles: ['src/client.tsx'],
			},
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods':
					'GET, POST, PUT, DELETE, PATCH, OPTIONS',
				'Access-Control-Allow-Headers':
					'X-Requested-With, content-type, Authorization',
			},
			fs: {
				allow: [
					PROJECT_ROOT,
					GDU_ROOT,
					...(CALLING_WORKSPACE_ROOT ? [CALLING_WORKSPACE_ROOT] : []),
				],
			},
		},

		optimizeDeps: {
			include: [
				'relay-runtime',
				'react-relay',
				'react-relay/hooks',
				'@datadog/browser-rum',
				'@datadog/browser-logs',
				'@datadog/browser-rum-react',
				'xstate',
				'@xstate/react',
				'cssesc',
				'css-what',
				'dedent',
				'media-query-parser',
				'deepmerge',
				'picocolors',
			],
			exclude: ['@vanilla-extract/css'],
		},

		// 'custom' prevents Vite from looking for a physical index.html;
		// our plugin handles HTML serving with SPA fallback instead.
		appType: 'custom',

		plugins: [
			...(vanillaExtractPlugin ? [vanillaExtractPlugin()] : []),
			...(relayTransformPlugin ? [relayTransformPlugin] : []),
			relayCjsToEsmPlugin(),
			guruConfigCjsPlugin(),
			spaHtmlPlugin(guruConfig),
		],
	});

	await server.listen();

	let networkAddress = '<network-address>';
	try {
		networkAddress = require('ip').address();
	} catch {
		// ip package not available
	}
	const resolvedUrls = server.resolvedUrls;
	const localUrl =
		resolvedUrls?.local?.[0] ?? `http://localhost:${guruConfig.port}/`;
	const networkUrl =
		resolvedUrls?.network?.[0] ??
		`http://${networkAddress}:${guruConfig.port}/`;

	console.log(dedent`

		You can now view ${bold(getProjectName())} in the browser.

		  Local:            ${blue(localUrl)}
		  On Your Network:  ${blue(networkUrl)}

		Note that the development build is not optimised.
		To create a production build, use ${cyan('yarn build')}.

	`);
};
