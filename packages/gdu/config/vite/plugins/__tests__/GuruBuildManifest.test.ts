import { collectEntryCssFiles } from '../GuruBuildManifest';

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
			new Set([
				'assets/main-abc123.css',
				'assets/vendor-def456.css',
			]),
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
			new Set([
				'assets/entry.css',
				'assets/a.css',
				'assets/b.css',
			]),
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
