// Inline Vite/Rollup types so tsc compiles without a vite dependency.
// At runtime, the actual Vite/Rollup types are structurally compatible.

export interface RollupInputOptions {
	input?: string | string[] | Record<string, string>;
	external?: string[];
	plugins?: unknown[];
}

export interface RollupOutputOptions {
	format?: string;
	entryFileNames?: string;
	chunkFileNames?: string;
	assetFileNames?: string;
	paths?: Record<string, string>;
}

export interface RollupOutputChunk {
	type: 'chunk';
	fileName: string;
	isEntry: boolean;
	isDynamicEntry: boolean;
	viteMetadata?: { importedCss?: Set<string> };
}

export interface RollupOutputAsset {
	type: 'asset';
	fileName: string;
	source?: string;
}

export type RollupOutputItem = RollupOutputChunk | RollupOutputAsset;

export interface EmittedAsset {
	type: 'asset';
	fileName: string;
	source: string;
}

export interface PluginContext {
	emitFile: (asset: EmittedAsset) => string;
}

export interface VitePlugin {
	name: string;
	apply?: 'build' | 'serve';
	transform?: (
		code: string,
		id: string,
	) => { code: string; map: null } | null;
	configureServer?: (server: any) => void | (() => void);
	generateBundle?: (
		this: PluginContext,
		options: unknown,
		bundle: Record<string, RollupOutputItem>,
	) => void | Promise<void>;
	writeBundle?: (
		options: unknown,
		bundle: Record<string, RollupOutputItem>,
	) => void;
}

export interface ViteServerOptions {
	port?: number;
	strictPort?: boolean;
	host?: string | boolean;
	cors?: boolean;
	headers?: Record<string, string>;
	fs?: { allow?: string[] };
	hmr?: boolean | { overlay?: boolean };
	warmup?: { clientFiles?: string[] };
}

export interface ViteDevServer {
	listen: () => Promise<void>;
	resolvedUrls: { local: string[]; network: string[] } | null;
	transformIndexHtml: (url: string, html: string) => Promise<string>;
	middlewares: {
		use: (handler: (...args: any[]) => void) => void;
	};
}

export interface InlineConfig {
	root?: string;
	base?: string;
	resolve?: {
		alias?: Record<string, string>;
		extensions?: string[];
	};
	define?: Record<string, string>;
	build?: {
		target?: string;
		outDir?: string;
		emptyOutDir?: boolean;
		sourcemap?: boolean | 'hidden';
		minify?: string;
		reportCompressedSize?: boolean;
		chunkSizeWarningLimit?: number;
		rollupOptions?: RollupInputOptions & {
			output?: RollupOutputOptions;
		};
	};
	esbuild?: {
		target?: string;
		legalComments?: string;
		pure?: string[];
		jsx?: string;
		jsxImportSource?: string;
		jsxDev?: boolean;
	};
	css?: { devSourcemap?: boolean };
	server?: ViteServerOptions;
	plugins?: unknown[];
	appType?: string;
	optimizeDeps?: {
		include?: string[];
		exclude?: string[];
	};
	[key: string]: unknown;
}
