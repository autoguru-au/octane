// Inline Vite/Rolldown types so tsc compiles without a vite dependency.
// At runtime, the actual Vite/Rolldown types are structurally compatible.

export interface RolldownInputOptions {
	input?: string | string[] | Record<string, string>;
	external?: string[];
	plugins?: unknown[];
}

export interface RolldownOutputOptions {
	format?: string;
	entryFileNames?: string;
	chunkFileNames?: string;
	assetFileNames?: string;
	paths?: Record<string, string>;
}

export interface RolldownOutputChunk {
	type: 'chunk';
	fileName: string;
	isEntry: boolean;
	isDynamicEntry: boolean;
	viteMetadata?: { importedCss?: Set<string> };
}

export interface RolldownOutputAsset {
	type: 'asset';
	fileName: string;
	source?: string;
}

export type RolldownOutputItem = RolldownOutputChunk | RolldownOutputAsset;

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
	renderChunk?: (
		code: string,
		chunk: { fileName: string; isEntry?: boolean },
	) => { code: string; map: null; moduleType?: string } | null;
	configureServer?: (server: any) => void | (() => void);
	generateBundle?: (
		this: PluginContext,
		options: unknown,
		bundle: Record<string, RolldownOutputItem>,
	) => void | Promise<void>;
	writeBundle?: (
		options: unknown,
		bundle: Record<string, RolldownOutputItem>,
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
		minify?: boolean | string;
		reportCompressedSize?: boolean;
		chunkSizeWarningLimit?: number;
		rolldownOptions?: RolldownInputOptions & {
			output?: RolldownOutputOptions;
		};
	};
	oxc?: {
		target?: string;
		jsx?: {
			runtime?: string;
			importSource?: string;
			development?: boolean;
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
