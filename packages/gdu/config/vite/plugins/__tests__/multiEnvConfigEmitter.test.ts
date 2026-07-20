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

type MfeEnv = Record<string, Record<string, unknown>>;

// The namespaced seed shape the emitter produces:
// globalThis.__MFE_ENV__=globalThis.__MFE_ENV__||{};globalThis.__MFE_ENV__[<ns>]=Object.assign(globalThis.__MFE_ENV__[<ns>]||{},<json>);
const SEED_RE =
	/^globalThis\.__MFE_ENV__=globalThis\.__MFE_ENV__\|\|\{\};globalThis\.__MFE_ENV__\[("(?:[^"\\]|\\.)*")\]=Object\.assign\(globalThis\.__MFE_ENV__\[\1\]\|\|\{\},(\{.*\})\);$/;

/**
 * Reproduces one emitted seed's runtime effect by parsing its known shape
 * (which fails unless the namespaced merge form is intact) and merging the
 * payload under the app's namespace — no eval. Passing `undefined` models the
 * first seed on a fresh page.
 */
function applySeed(env: MfeEnv | undefined, source: string): MfeEnv {
	const match = SEED_RE.exec(source);
	if (!match)
		throw new Error(`seed is not in namespaced merge form: ${source}`);
	const ns = JSON.parse(match[1]) as string;
	const values = JSON.parse(match[2]) as Record<string, unknown>;
	const next: MfeEnv = { ...env };
	next[ns] = { ...next[ns], ...values };
	return next;
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

	it('bakes allowlisted, per-combo values under the app namespace with no chunk body', () => {
		root = writeWorkspace();
		const emitted = runGenerateBundle(makePlugin(root), [CONFIG_CHUNK]);

		const au = emitted.find((a) => a.fileName.includes('dev_au'))!;
		const nz = emitted.find((a) => a.fileName.includes('dev_nz'))!;

		expect(au.source).toBe(
			'globalThis.__MFE_ENV__=globalThis.__MFE_ENV__||{};globalThis.__MFE_ENV__["@autoguru/fls-booking"]=Object.assign(globalThis.__MFE_ENV__["@autoguru/fls-booking"]||{},{"baseUrl":"https://au"});',
		);
		expect(nz.source).toBe(
			'globalThis.__MFE_ENV__=globalThis.__MFE_ENV__||{};globalThis.__MFE_ENV__["@autoguru/fls-booking"]=Object.assign(globalThis.__MFE_ENV__["@autoguru/fls-booking"]||{},{"baseUrl":"https://nz"});',
		);
		expect(au.source).not.toContain('cdkOnly');
	});

	it('seeds a fresh object under the app namespace when no earlier app has run', () => {
		root = writeWorkspace();
		const emitted = runGenerateBundle(makePlugin(root), [CONFIG_CHUNK]);
		const au = emitted.find((a) => a.fileName.includes('dev_au'))!;

		expect(applySeed(undefined, au.source)).toEqual({
			'@autoguru/fls-booking': { baseUrl: 'https://au' },
		});
	});

	it('keeps each co-mounted app in its own namespace so neither clobbers the other', () => {
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
			'@autoguru/fls-booking': { baseUrl: 'https://au' },
			'@autoguru/other-app': { apiUrl: 'https://api' },
		});
	});

	it('does not clobber a co-mounted app that seeds the SAME key with a different value', () => {
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
		// Both apps read `baseUrl`, but the app-config overrides give them
		// different values — the exact shape that clobbered under the flat layout.
		mkdirSync(join(root, '.mfe-data', 'app-configs', 'other-app'), {
			recursive: true,
		});
		writeFileSync(
			join(root, '.mfe-data', 'app-configs', 'other-app', 'dev_au.json'),
			JSON.stringify({ baseUrl: 'https://other' }),
		);
		const first = runGenerateBundle(makePlugin(root), [CONFIG_CHUNK]).find(
			(a) => a.fileName.includes('dev_au'),
		)!;
		const secondPlugin = multiEnvConfigEmitter({
			appName: '@autoguru/other-app',
			workspaceRoot: root,
			envTokenMap: { baseUrl: '"#{BASE_URL}"' },
		});
		const second = runGenerateBundle(secondPlugin, [CONFIG_CHUNK]).find(
			(a) => a.fileName.includes('dev_au'),
		)!;

		const env = applySeed(
			applySeed(undefined, first.source),
			second.source,
		);

		expect(env['@autoguru/fls-booking'].baseUrl).toBe('https://au');
		expect(env['@autoguru/other-app'].baseUrl).toBe('https://other');
	});

	it('applies last-wins within a namespace without touching other namespaces', () => {
		root = writeWorkspace();
		const au = runGenerateBundle(makePlugin(root), [CONFIG_CHUNK]).find(
			(a) => a.fileName.includes('dev_au'),
		)!;

		const env = applySeed(
			{
				'@autoguru/fls-booking': {
					baseUrl: 'https://stale',
					keep: 'me',
				},
				'@autoguru/sp-app-shell': { mfeBasePath: 'https://shell' },
			},
			au.source,
		);

		expect(env).toEqual({
			'@autoguru/fls-booking': { baseUrl: 'https://au', keep: 'me' },
			'@autoguru/sp-app-shell': { mfeBasePath: 'https://shell' },
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
