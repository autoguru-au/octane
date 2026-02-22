import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { blue, bold, cyan, green, magenta } from 'kleur';
import dedent from 'ts-dedent';

import { baseViteOptions } from '../../config/vite/vite.config';
import { relayPlugin } from '../../config/vite/plugins/relay';
import { getProjectName, GuruConfig } from '../../lib/config';
import {
	CALLING_WORKSPACE_ROOT,
	GDU_ROOT,
	PROJECT_ROOT,
} from '../../lib/roots';

// Inline Vite types so tsc compiles without a vite dependency.
// At runtime, the actual Vite types are structurally compatible.

interface ViteServerOptions {
	port?: number;
	strictPort?: boolean;
	host?: string | boolean;
	cors?: boolean;
	headers?: Record<string, string>;
	fs?: { allow?: string[] };
}

interface VitePlugin {
	name: string;
	configureServer?: (server: any) => void | (() => void);
	transform?: (
		code: string,
		id: string,
	) => { code: string; map: null } | null;
}

interface ViteInlineConfig {
	root?: string;
	resolve?: Record<string, unknown>;
	define?: Record<string, string>;
	esbuild?: Record<string, unknown>;
	server?: ViteServerOptions;
	plugins?: unknown[];
	appType?: string;
}

interface ViteDevServer {
	listen: () => Promise<void>;
	resolvedUrls: { local: string[]; network: string[] } | null;
	transformIndexHtml: (url: string, html: string) => Promise<string>;
	middlewares: {
		use: (handler: (...args: any[]) => void) => void;
	};
}

const getConsumerHtmlTemplate = (
	guruConfig: GuruConfig,
): string | undefined => {
	try {
		const filePath = join(guruConfig.__configPath, '/template.html');
		if (existsSync(filePath)) {
			return filePath;
		}
	} finally {
		// empty
	}
	return void 0;
};

const gduEntryPath = join(GDU_ROOT, 'entry');

function guruConfigCjsPlugin(): VitePlugin {
	return {
		name: 'gdu-guru-config-cjs',
		transform(code, id) {
			if (!id.endsWith('guru.config.js')) return null;

			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const config = require(id);
			const keys = Object.keys(config);

			const lines = [
				'const __cjs = {};',
				'const module = { get exports() { return __cjs; }, set exports(v) { Object.assign(__cjs, v); } };',
				code,
				'export default __cjs;',
				...keys.map((k) => `export const ${k} = __cjs[${JSON.stringify(k)}];`),
			];

			return { code: lines.join('\n'), map: null };
		},
	};
}

function spaHtmlPlugin(guruConfig: GuruConfig): VitePlugin {
	const entryPath = join(gduEntryPath, 'spa', 'client.js');
	const templatePath = getConsumerHtmlTemplate(guruConfig);

	let baseHtml: string;

	if (templatePath) {
		baseHtml = readFileSync(templatePath, 'utf-8');
		if (!baseHtml.includes(entryPath)) {
			baseHtml = baseHtml.replace(
				'</body>',
				`<script type="module" src="/@fs/${entryPath}"></script>\n</body>`,
			);
		}
		if (!baseHtml.includes("id='app'") && !baseHtml.includes('id="app"')) {
			baseHtml = baseHtml.replace('<body>', '<body>\n<div id="app"></div>');
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
						.catch(() => next());
				});
			};
		},
	};
}

export const runSPAVite = async (guruConfig: GuruConfig, isDebug) => {
	console.log(
		`${cyan('Starting Vite dev server...')}${
			isDebug ? magenta(' DEBUG MODE') : ''
		}`,
	);

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
		createServer: (config: ViteInlineConfig) => Promise<ViteDevServer>;
	};

	// Load Vite-dependent plugins at runtime to avoid tsc compilation errors.
	let vanillaExtractPlugin: (() => unknown) | undefined;
	try {
		vanillaExtractPlugin = require('@vanilla-extract/vite-plugin')
			.vanillaExtractPlugin;
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
					...(CALLING_WORKSPACE_ROOT
						? [CALLING_WORKSPACE_ROOT]
						: []),
				],
			},
		},

		// 'custom' prevents Vite from looking for a physical index.html;
		// our plugin handles HTML serving with SPA fallback instead.
		appType: 'custom',

		plugins: [
			...(vanillaExtractPlugin ? [vanillaExtractPlugin()] : []),
			...(relayTransformPlugin ? [relayTransformPlugin] : []),
			guruConfigCjsPlugin(),
			spaHtmlPlugin(guruConfig),
		],
	});

	await server.listen();

	const networkAddress = require('ip').address();
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
