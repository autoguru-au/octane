import fs from 'fs';
import os from 'os';
import path from 'path';

import { rolldownExternalShim } from '../rolldownExternalShim';

function makeTmpDir() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'shim-test-'));
}

function makeBundle(fileName: string, isEntry: boolean) {
	return {
		[fileName]: {
			type: 'chunk' as const,
			fileName,
			isEntry,
			isDynamicEntry: false,
		},
	};
}

const externals = {
	react: 'https://esm.sh/react@19',
	'react-dom': 'https://esm.sh/react-dom@19',
};

describe('rolldownExternalShim', () => {
	describe('when externals is empty', () => {
		it('returns a no-op plugin', () => {
			const plugin = rolldownExternalShim({});
			expect(plugin.name).toBe('rolldown-external-shim');
			expect(plugin).not.toHaveProperty('writeBundle');
		});
	});

	describe('when externals are provided', () => {
		let tmpDir: string;

		beforeEach(() => {
			tmpDir = makeTmpDir();
		});

		afterEach(() => {
			fs.rmSync(tmpDir, { recursive: true, force: true });
		});

		it('creates an inner file with the original entry code', () => {
			const entryCode =
				'import{n}from"./chunks/runtime.js";console.log(n);';
			fs.writeFileSync(path.join(tmpDir, 'main-AbCd1234.js'), entryCode);

			const plugin = rolldownExternalShim(externals);
			const bundle = makeBundle('main-AbCd1234.js', true);

			(plugin as any).writeBundle({ dir: tmpDir }, bundle);

			const innerPath = path.join(tmpDir, 'main-inner-AbCd1234.js');
			expect(fs.existsSync(innerPath)).toBe(true);
			expect(fs.readFileSync(innerPath, 'utf8')).toBe(entryCode);
		});

		it('replaces the entry with a wrapper containing no static imports', () => {
			fs.writeFileSync(
				path.join(tmpDir, 'main-AbCd1234.js'),
				'import{n}from"./chunks/runtime.js";',
			);

			const plugin = rolldownExternalShim(externals);
			const bundle = makeBundle('main-AbCd1234.js', true);

			(plugin as any).writeBundle({ dir: tmpDir }, bundle);

			const wrapperCode = fs.readFileSync(
				path.join(tmpDir, 'main-AbCd1234.js'),
				'utf8',
			);

			expect(wrapperCode).not.toContain('import{');
			expect(wrapperCode).not.toContain('import {');
			expect(wrapperCode).toContain('globalThis.require');
			expect(wrapperCode).toContain('__xrc');
			expect(wrapperCode).toContain('await Promise.allSettled');
			expect(wrapperCode).toContain(
				'await import("./main-inner-AbCd1234.js")',
			);
		});

		it('includes all external URLs in the shim preloads', () => {
			fs.writeFileSync(
				path.join(tmpDir, 'main-AbCd1234.js'),
				'console.log("entry")',
			);

			const plugin = rolldownExternalShim(externals);
			const bundle = makeBundle('main-AbCd1234.js', true);

			(plugin as any).writeBundle({ dir: tmpDir }, bundle);

			const wrapperCode = fs.readFileSync(
				path.join(tmpDir, 'main-AbCd1234.js'),
				'utf8',
			);

			expect(wrapperCode).toContain('https://esm.sh/react@19');
			expect(wrapperCode).toContain('https://esm.sh/react-dom@19');
		});

		it('moves the sourcemap to the inner file and removes the stale entry map', () => {
			fs.writeFileSync(
				path.join(tmpDir, 'main-AbCd1234.js'),
				'console.log("entry")',
			);
			fs.writeFileSync(
				path.join(tmpDir, 'main-AbCd1234.js.map'),
				'{"version":3}',
			);

			const plugin = rolldownExternalShim(externals);
			const bundle = makeBundle('main-AbCd1234.js', true);

			(plugin as any).writeBundle({ dir: tmpDir }, bundle);

			const innerMapPath = path.join(
				tmpDir,
				'main-inner-AbCd1234.js.map',
			);
			const entryMapPath = path.join(tmpDir, 'main-AbCd1234.js.map');

			expect(fs.existsSync(innerMapPath)).toBe(true);
			expect(fs.readFileSync(innerMapPath, 'utf8')).toBe(
				'{"version":3}',
			);
			expect(fs.existsSync(entryMapPath)).toBe(false);
		});

		it('handles entries without a sourcemap', () => {
			fs.writeFileSync(
				path.join(tmpDir, 'main-AbCd1234.js'),
				'console.log("entry")',
			);

			const plugin = rolldownExternalShim(externals);
			const bundle = makeBundle('main-AbCd1234.js', true);

			(plugin as any).writeBundle({ dir: tmpDir }, bundle);

			expect(
				fs.existsSync(path.join(tmpDir, 'main-inner-AbCd1234.js.map')),
			).toBe(false);
		});

		it('skips non-entry chunks', () => {
			const chunkCode = 'console.log("chunk")';
			fs.mkdirSync(path.join(tmpDir, 'chunks'), { recursive: true });
			fs.writeFileSync(
				path.join(tmpDir, 'chunks/helpers-XyZ.js'),
				chunkCode,
			);

			const plugin = rolldownExternalShim(externals);
			const bundle = makeBundle('chunks/helpers-XyZ.js', false);

			(plugin as any).writeBundle({ dir: tmpDir }, bundle);

			expect(
				fs.readFileSync(
					path.join(tmpDir, 'chunks/helpers-XyZ.js'),
					'utf8',
				),
			).toBe(chunkCode);
		});

		it('returns early when options.dir is undefined', () => {
			const plugin = rolldownExternalShim(externals);
			const bundle = makeBundle('main-AbCd1234.js', true);

			expect(() => {
				(plugin as any).writeBundle({}, bundle);
			}).not.toThrow();
		});
	});
});
