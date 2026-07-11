import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { multiEnvConfigEmitter } from '../multiEnvConfigEmitter';

interface EmittedAsset {
	type: 'asset';
	fileName: string;
	source: string;
}

const APP = '@autoguru/fls-booking';
const CONFIG_CHUNK = 'mfe-configs-Zx8yQ1a2.js';

function writeWorkspace(): string {
	const root = mkdtempSync(join(tmpdir(), 'emitter-'));
	const dataRoot = join(root, '.mfe-data');
	mkdirSync(join(dataRoot, 'env-configs'), { recursive: true });
	writeFileSync(
		join(dataRoot, 'mfe-list.json'),
		JSON.stringify({
			spa: { 'fls-booking': { au: ['dev'], nz: ['dev'] } },
		}),
	);
	writeFileSync(
		join(dataRoot, 'env-configs', 'dev_au.json'),
		JSON.stringify({ baseUrl: 'https://au', cdkOnly: 'x' }),
	);
	writeFileSync(
		join(dataRoot, 'env-configs', 'dev_nz.json'),
		JSON.stringify({ baseUrl: 'https://nz', cdkOnly: 'x' }),
	);
	return root;
}

function makePlugin(root: string) {
	return multiEnvConfigEmitter({
		appName: APP,
		workspaceRoot: root,
		envTokenMap: { baseUrl: '"#{BASE_URL}"' },
	});
}

function runGenerateBundle(
	plugin: ReturnType<typeof multiEnvConfigEmitter>,
	bundleKeys: string[],
): EmittedAsset[] {
	const emitted: EmittedAsset[] = [];
	const ctx = {
		emitFile: (asset: EmittedAsset) => {
			emitted.push(asset);
			return asset.fileName;
		},
	};
	const bundle: Record<string, { type: string; fileName: string }> = {};
	for (const key of bundleKeys) {
		bundle[key] = { type: 'chunk', fileName: key };
	}
	(plugin.generateBundle as unknown as (...a: unknown[]) => void).call(
		ctx,
		{},
		bundle,
	);
	return emitted;
}

const SEED_PREFIX =
	'globalThis.__MFE_ENV__=Object.assign(globalThis.__MFE_ENV__||{},';
const SEED_SUFFIX = ');';

/**
 * Mirrors what a browser does when it runs one emitted seed: the seed is
 * `globalThis.__MFE_ENV__=Object.assign(globalThis.__MFE_ENV__||{},{...})`, so
 * parsing the payload out of that exact shape (which fails unless the merge form
 * is intact) and `Object.assign`-ing it onto the running env reproduces the seed
 * without eval. Feeding `undefined` models the first seed on a fresh page.
 */
function applySeed(
	env: Record<string, unknown> | undefined,
	source: string,
): Record<string, unknown> {
	if (!source.startsWith(SEED_PREFIX) || !source.endsWith(SEED_SUFFIX)) {
		throw new Error(`seed is not in merge form: ${source}`);
	}
	const payload = source.slice(SEED_PREFIX.length, -SEED_SUFFIX.length);
	return Object.assign(env ?? {}, JSON.parse(payload));
}

describe('multiEnvConfigEmitter', () => {
	let root: string;
	afterEach(() => {
		if (root) rmSync(root, { recursive: true, force: true });
	});

	it('emits nothing when the bundle has no mfe-configs chunk', () => {
		root = writeWorkspace();
		const emitted = runGenerateBundle(makePlugin(root), [
			'main-abc12345.js',
		]);
		expect(emitted).toHaveLength(0);
	});

	it('emits one init-only config script per combo', () => {
		root = writeWorkspace();
		const emitted = runGenerateBundle(makePlugin(root), [
			CONFIG_CHUNK,
			'main-abc12345.js',
		]);

		expect(emitted.map((a) => a.fileName).sort()).toEqual([
			expect.stringMatching(/^mfe-configs-dev_au-[a-f0-9]{8}\.js$/),
			expect.stringMatching(/^mfe-configs-dev_nz-[a-f0-9]{8}\.js$/),
		]);
	});

	it('detects the config chunk when its base64url hash contains _ or -', () => {
		root = writeWorkspace();
		const emitted = runGenerateBundle(makePlugin(root), [
			'mfe-configs-BRHYz_Ev.js',
			'main-abc12345.js',
		]);

		expect(emitted.map((a) => a.fileName).sort()).toEqual([
			expect.stringMatching(/^mfe-configs-dev_au-[a-f0-9]{8}\.js$/),
			expect.stringMatching(/^mfe-configs-dev_nz-[a-f0-9]{8}\.js$/),
		]);
	});

	it('bakes allowlisted, per-combo values with no chunk body', () => {
		root = writeWorkspace();
		const emitted = runGenerateBundle(makePlugin(root), [CONFIG_CHUNK]);

		const au = emitted.find((a) => a.fileName.includes('dev_au'))!;
		const nz = emitted.find((a) => a.fileName.includes('dev_nz'))!;

		expect(au.source).toBe(
			'globalThis.__MFE_ENV__=Object.assign(globalThis.__MFE_ENV__||{},{"baseUrl":"https://au"});',
		);
		expect(nz.source).toBe(
			'globalThis.__MFE_ENV__=Object.assign(globalThis.__MFE_ENV__||{},{"baseUrl":"https://nz"});',
		);
		expect(au.source).not.toContain('cdkOnly');
	});

	it('seeds a fresh object when no earlier app has run (first seed on a page)', () => {
		root = writeWorkspace();
		const emitted = runGenerateBundle(makePlugin(root), [CONFIG_CHUNK]);
		const au = emitted.find((a) => a.fileName.includes('dev_au'))!;

		expect(applySeed(undefined, au.source)).toEqual({
			baseUrl: 'https://au',
		});
	});

	it('composes two co-mounted apps so both keep their own keys', () => {
		root = writeWorkspace();
		writeFileSync(
			join(root, '.mfe-data', 'mfe-list.json'),
			JSON.stringify({
				spa: {
					'fls-booking': { au: ['dev'], nz: ['dev'] },
					'other-app': { au: ['dev'], nz: ['dev'] },
				},
			}),
		);
		writeFileSync(
			join(root, '.mfe-data', 'env-configs', 'dev_au.json'),
			JSON.stringify({
				baseUrl: 'https://au',
				apiUrl: 'https://api',
				cdkOnly: 'x',
			}),
		);
		const first = runGenerateBundle(makePlugin(root), [CONFIG_CHUNK]).find(
			(a) => a.fileName.includes('dev_au'),
		)!;
		const secondPlugin = multiEnvConfigEmitter({
			appName: '@autoguru/other-app',
			workspaceRoot: root,
			envTokenMap: { apiUrl: '"#{API_URL}"' },
		});
		const second = runGenerateBundle(secondPlugin, [CONFIG_CHUNK]).find(
			(a) => a.fileName.includes('dev_au'),
		)!;

		const env = applySeed(
			applySeed(undefined, first.source),
			second.source,
		);

		expect(env).toEqual({
			baseUrl: 'https://au',
			apiUrl: 'https://api',
		});
	});

	it('applies last-wins on a key an earlier app already seeded', () => {
		root = writeWorkspace();
		const au = runGenerateBundle(makePlugin(root), [CONFIG_CHUNK]).find(
			(a) => a.fileName.includes('dev_au'),
		)!;

		const env = applySeed(
			{ baseUrl: 'https://stale', keep: 'me' },
			au.source,
		);

		expect(env).toEqual({
			baseUrl: 'https://au',
			keep: 'me',
		});
	});

	it('gives each combo a distinct content hash', () => {
		root = writeWorkspace();
		const emitted = runGenerateBundle(makePlugin(root), [CONFIG_CHUNK]);
		expect(emitted[0].fileName).not.toBe(emitted[1].fileName);
	});

	it('emits nothing and warns when the app has no combos', () => {
		root = writeWorkspace();
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
		const plugin = multiEnvConfigEmitter({
			appName: 'unlisted-app',
			workspaceRoot: root,
			envTokenMap: { baseUrl: '"#{BASE_URL}"' },
		});

		const emitted = runGenerateBundle(plugin, [CONFIG_CHUNK]);

		expect(emitted).toHaveLength(0);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});
});
