import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import {
	collectEntryCssFiles,
	collectEnvConfigChunks,
	guruBuildManifest,
} from '../GuruBuildManifest';

type BundleChunk = {
	type: string;
	isEntry?: boolean;
	imports?: string[];
	dynamicImports?: string[];
	viteMetadata?: { importedCss?: Set<string> };
};

type MockBundle = Record<string, BundleChunk>;

describe('collectEntryCssFiles', () => {
	it('collects CSS only from the entry chunk itself', () => {
		const bundle: MockBundle = {
			'assets/main-abc123.js': {
				type: 'chunk',
				isEntry: true,
				viteMetadata: {
					importedCss: new Set(['assets/main-abc123.css']),
				},
			},
		};

		const result = collectEntryCssFiles(bundle);

		expect(result).toEqual(new Set(['assets/main-abc123.css']));
	});

	it('collects CSS from statically imported sibling chunks', () => {
		const bundle: MockBundle = {
			'assets/main-abc123.js': {
				type: 'chunk',
				isEntry: true,
				imports: ['assets/vendor-def456.js'],
				viteMetadata: {
					importedCss: new Set(['assets/main-abc123.css']),
				},
			},
			'assets/vendor-def456.js': {
				type: 'chunk',
				viteMetadata: {
					importedCss: new Set(['assets/vendor-def456.css']),
				},
			},
		};

		const result = collectEntryCssFiles(bundle);

		expect(result).toEqual(
			new Set(['assets/main-abc123.css', 'assets/vendor-def456.css']),
		);
	});

	it('collects CSS from deep transitive static imports', () => {
		const bundle: MockBundle = {
			'assets/entry-aaa.js': {
				type: 'chunk',
				isEntry: true,
				imports: ['assets/a-bbb.js'],
				viteMetadata: {
					importedCss: new Set(['assets/entry.css']),
				},
			},
			'assets/a-bbb.js': {
				type: 'chunk',
				imports: ['assets/b-ccc.js'],
				viteMetadata: {
					importedCss: new Set(['assets/a.css']),
				},
			},
			'assets/b-ccc.js': {
				type: 'chunk',
				imports: ['assets/c-ddd.js'],
				viteMetadata: {
					importedCss: new Set(['assets/b.css']),
				},
			},
			'assets/c-ddd.js': {
				type: 'chunk',
				viteMetadata: {
					importedCss: new Set(['assets/c.css']),
				},
			},
		};

		const result = collectEntryCssFiles(bundle);

		expect(result).toEqual(
			new Set([
				'assets/entry.css',
				'assets/a.css',
				'assets/b.css',
				'assets/c.css',
			]),
		);
	});

	it('handles circular imports without infinite looping', () => {
		const bundle: MockBundle = {
			'assets/entry-aaa.js': {
				type: 'chunk',
				isEntry: true,
				imports: ['assets/a-bbb.js'],
				viteMetadata: {
					importedCss: new Set(['assets/entry.css']),
				},
			},
			'assets/a-bbb.js': {
				type: 'chunk',
				imports: ['assets/b-ccc.js'],
				viteMetadata: {
					importedCss: new Set(['assets/a.css']),
				},
			},
			'assets/b-ccc.js': {
				type: 'chunk',
				imports: ['assets/a-bbb.js'],
				viteMetadata: {
					importedCss: new Set(['assets/b.css']),
				},
			},
		};

		const result = collectEntryCssFiles(bundle);

		expect(result).toEqual(
			new Set(['assets/entry.css', 'assets/a.css', 'assets/b.css']),
		);
	});

	it('does not collect CSS from dynamically imported chunks', () => {
		const bundle: MockBundle = {
			'assets/main-abc123.js': {
				type: 'chunk',
				isEntry: true,
				imports: ['assets/static-dep.js'],
				dynamicImports: ['assets/lazy-page.js'],
				viteMetadata: {
					importedCss: new Set(['assets/main.css']),
				},
			},
			'assets/static-dep.js': {
				type: 'chunk',
				viteMetadata: {
					importedCss: new Set(['assets/static.css']),
				},
			},
			'assets/lazy-page.js': {
				type: 'chunk',
				viteMetadata: {
					importedCss: new Set(['assets/lazy.css']),
				},
			},
		};

		const result = collectEntryCssFiles(bundle);

		expect(result).toEqual(
			new Set(['assets/main.css', 'assets/static.css']),
		);
		expect(result.has('assets/lazy.css')).toBe(false);
	});

	it('handles chunks without viteMetadata gracefully', () => {
		const bundle: MockBundle = {
			'assets/main-abc123.js': {
				type: 'chunk',
				isEntry: true,
				imports: ['assets/no-css.js', 'assets/no-metadata.js'],
				viteMetadata: {
					importedCss: new Set(['assets/main.css']),
				},
			},
			'assets/no-css.js': {
				type: 'chunk',
				viteMetadata: {},
			},
			'assets/no-metadata.js': {
				type: 'chunk',
			},
		};

		const result = collectEntryCssFiles(bundle);

		expect(result).toEqual(new Set(['assets/main.css']));
	});

	it('collects CSS independently from multiple entry chunks', () => {
		const bundle: MockBundle = {
			'assets/app-aaa.js': {
				type: 'chunk',
				isEntry: true,
				imports: ['assets/shared-lib.js'],
				viteMetadata: {
					importedCss: new Set(['assets/app.css']),
				},
			},
			'assets/worker-bbb.js': {
				type: 'chunk',
				isEntry: true,
				imports: ['assets/worker-dep.js'],
				viteMetadata: {
					importedCss: new Set(['assets/worker.css']),
				},
			},
			'assets/shared-lib.js': {
				type: 'chunk',
				viteMetadata: {
					importedCss: new Set(['assets/shared.css']),
				},
			},
			'assets/worker-dep.js': {
				type: 'chunk',
				viteMetadata: {
					importedCss: new Set(['assets/worker-dep.css']),
				},
			},
		};

		const result = collectEntryCssFiles(bundle);

		expect(result).toEqual(
			new Set([
				'assets/app.css',
				'assets/shared.css',
				'assets/worker.css',
				'assets/worker-dep.css',
			]),
		);
	});
});

describe('collectEnvConfigChunks', () => {
	it('byte-matches the 00-overview §4c env-map shape', () => {
		const fileNames = [
			'main-ab12cd34.js',
			'chunks/Box-1a2b3c4d.js',
			'mfe-configs-dev_au-1a2b3c4d.js',
			'mfe-configs-dev_nz-3c4d5e6f.js',
			'mfe-configs-prod_au-5e6f7a8b.js',
		];

		const env = collectEnvConfigChunks(fileNames);

		expect(JSON.stringify(env)).toBe(
			'{"dev_au":{"config":"mfe-configs-dev_au-1a2b3c4d.js"},' +
				'"dev_nz":{"config":"mfe-configs-dev_nz-3c4d5e6f.js"},' +
				'"prod_au":{"config":"mfe-configs-prod_au-5e6f7a8b.js"}}',
		);
	});

	it('ignores the un-infixed mfe-configs app chunk', () => {
		const env = collectEnvConfigChunks(['mfe-configs-1a2b3c4d.js']);
		expect(env).toEqual({});
	});

	it('ignores confusably named non-config chunks', () => {
		const env = collectEnvConfigChunks([
			'mfe-configs-panel-1a2b3c4d.js',
			'mfe-configs-dev_au-1a2b3c4d.css',
			'main-1a2b3c4d.js',
		]);
		expect(env).toEqual({});
	});

	it('sorts combo keys for stable manifest bytes regardless of input order', () => {
		const env = collectEnvConfigChunks([
			'mfe-configs-prod_au-5e6f7a8b.js',
			'mfe-configs-dev_au-1a2b3c4d.js',
		]);
		expect(Object.keys(env)).toEqual(['dev_au', 'prod_au']);
	});

	it('prepends the publicPath to each config path', () => {
		const env = collectEnvConfigChunks(
			['mfe-configs-dev_au-1a2b3c4d.js'],
			'https://cdn/app/v1/',
		);
		expect(env.dev_au.config).toBe(
			'https://cdn/app/v1/mfe-configs-dev_au-1a2b3c4d.js',
		);
	});
});

describe('guruBuildManifest env map', () => {
	type ManifestChunk = {
		type: string;
		isEntry?: boolean;
		source?: string;
		viteMetadata?: { importedCss?: Set<string> };
	};

	const tempDirs: string[] = [];
	afterAll(() => {
		for (const dir of tempDirs)
			rmSync(dir, { recursive: true, force: true });
	});

	function writeManifest(bundle: Record<string, ManifestChunk>): {
		env?: Record<string, { config: string }>;
	} {
		const outputDir = mkdtempSync(join(tmpdir(), 'gdu-manifest-'));
		tempDirs.push(outputDir);
		const plugin = guruBuildManifest({
			mountDOMId: 'root',
			mountDOMClass: 'cls',
			frameless: false,
			outputDir,
			includeChunks: true,
		});
		plugin.writeBundle?.({ dir: outputDir }, bundle as never);
		return JSON.parse(
			readFileSync(join(outputDir, 'build-manifest.json'), 'utf8'),
		);
	}

	it('omits the env key when no per-combo config assets are emitted (single-env default)', () => {
		const manifest = writeManifest({
			'main-ab12cd34.js': { type: 'chunk', isEntry: true },
			'mfe-configs-1a2b3c4d.js': { type: 'chunk', isEntry: false },
		});

		expect(manifest.env).toBeUndefined();
	});

	it('populates the env map when per-combo config assets are present (multi-env opt-in)', () => {
		const manifest = writeManifest({
			'main-ab12cd34.js': { type: 'chunk', isEntry: true },
			'mfe-configs-1a2b3c4d.js': { type: 'chunk', isEntry: false },
			'mfe-configs-dev_au-3c4d5e6f.js': { type: 'asset' },
		});

		expect(manifest.env).toEqual({
			dev_au: { config: 'mfe-configs-dev_au-3c4d5e6f.js' },
		});
	});
});
