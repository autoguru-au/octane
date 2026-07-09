import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import {
	mergeConfigSources,
	resolveCombosForApp,
	toBareAppName,
} from '../mfeDataReader';

interface FixtureShape {
	mfeList?: unknown;
	envConfigs?: Record<string, Record<string, unknown>>;
	appConfigs?: Record<string, Record<string, Record<string, unknown>>>;
}

function writeFixture(fixture: FixtureShape): string {
	const root = mkdtempSync(join(tmpdir(), 'mfe-data-'));
	const dataRoot = join(root, '.mfe-data');
	mkdirSync(dataRoot, { recursive: true });

	if (fixture.mfeList !== undefined) {
		writeFileSync(
			join(dataRoot, 'mfe-list.json'),
			JSON.stringify(fixture.mfeList),
		);
	}

	for (const [combo, values] of Object.entries(fixture.envConfigs ?? {})) {
		mkdirSync(join(dataRoot, 'env-configs'), { recursive: true });
		writeFileSync(
			join(dataRoot, 'env-configs', `${combo}.json`),
			JSON.stringify(values),
		);
	}

	for (const [app, combos] of Object.entries(fixture.appConfigs ?? {})) {
		const appDir = join(dataRoot, 'app-configs', app);
		mkdirSync(appDir, { recursive: true });
		for (const [combo, values] of Object.entries(combos)) {
			writeFileSync(
				join(appDir, `${combo}.json`),
				JSON.stringify(values),
			);
		}
	}

	return root;
}

describe('toBareAppName', () => {
	it('strips the @autoguru/ scope', () => {
		expect(toBareAppName('@autoguru/fls-booking')).toBe('fls-booking');
	});

	it('leaves an already-bare name unchanged', () => {
		expect(toBareAppName('fls-booking')).toBe('fls-booking');
	});
});

describe('resolveCombosForApp', () => {
	let root: string;
	afterEach(() => {
		if (root) rmSync(root, { recursive: true, force: true });
	});

	it('flattens the modal au-full + nz-three shape into 8 combos', () => {
		root = writeFixture({
			mfeList: {
				spa: {
					'fls-booking': {
						au: ['dev', 'uat', 'test', 'preprod', 'prod'],
						nz: ['dev', 'preprod', 'prod'],
					},
				},
			},
		});

		expect(resolveCombosForApp('@autoguru/fls-booking', root)).toEqual([
			{ env: 'dev', tenant: 'au' },
			{ env: 'uat', tenant: 'au' },
			{ env: 'test', tenant: 'au' },
			{ env: 'preprod', tenant: 'au' },
			{ env: 'prod', tenant: 'au' },
			{ env: 'dev', tenant: 'nz' },
			{ env: 'preprod', tenant: 'nz' },
			{ env: 'prod', tenant: 'nz' },
		]);
	});

	it('resolves an NZ-only outlier to NZ combos only', () => {
		root = writeFixture({
			mfeList: { spa: { 'nz-only-app': { nz: ['dev', 'prod'] } } },
		});

		expect(resolveCombosForApp('nz-only-app', root)).toEqual([
			{ env: 'dev', tenant: 'nz' },
			{ env: 'prod', tenant: 'nz' },
		]);
	});

	it('resolves an AU+NZ-full outlier across both tenants', () => {
		root = writeFixture({
			mfeList: {
				spa: {
					'both-full': {
						au: ['dev', 'prod'],
						nz: ['dev', 'prod'],
					},
				},
			},
		});

		expect(resolveCombosForApp('both-full', root)).toEqual([
			{ env: 'dev', tenant: 'au' },
			{ env: 'prod', tenant: 'au' },
			{ env: 'dev', tenant: 'nz' },
			{ env: 'prod', tenant: 'nz' },
		]);
	});

	it('yields no combos for a global-only app with no au/nz keys', () => {
		root = writeFixture({
			mfeList: { spa: { 'global-app': { global: ['shared'] } } },
		});

		expect(resolveCombosForApp('global-app', root)).toEqual([]);
	});

	it('yields no combos for an app absent from the list', () => {
		root = writeFixture({ mfeList: { spa: {} } });
		expect(resolveCombosForApp('missing-app', root)).toEqual([]);
	});

	it('yields no combos when the list is missing entirely', () => {
		root = writeFixture({});
		expect(resolveCombosForApp('any-app', root)).toEqual([]);
	});
});

describe('mergeConfigSources', () => {
	let root: string;
	afterEach(() => {
		if (root) rmSync(root, { recursive: true, force: true });
	});

	it('lets app-configs override env-configs (later wins)', () => {
		root = writeFixture({
			envConfigs: {
				dev_au: { baseUrl: 'https://env', shared: 'from-env' },
			},
			appConfigs: {
				'fls-booking': { dev_au: { shared: 'from-app' } },
			},
		});

		expect(
			mergeConfigSources(root, 'fls-booking', 'dev', 'au'),
		).toEqual({ baseUrl: 'https://env', shared: 'from-app' });
	});

	it('restricts the result to the allowlisted keys', () => {
		root = writeFixture({
			envConfigs: {
				dev_au: {
					baseUrl: 'https://env',
					cdkOnly: 'should-not-ship',
				},
			},
		});

		expect(
			mergeConfigSources(root, 'fls-booking', 'dev', 'au', [
				'baseUrl',
			]),
		).toEqual({ baseUrl: 'https://env' });
	});

	it('returns an empty object when both sources are missing', () => {
		root = writeFixture({});
		expect(
			mergeConfigSources(root, 'fls-booking', 'dev', 'au'),
		).toEqual({});
	});

	it('strips the scope before locating app-configs', () => {
		root = writeFixture({
			envConfigs: { prod_nz: { baseUrl: 'https://env' } },
			appConfigs: {
				'fls-booking': { prod_nz: { baseUrl: 'https://app' } },
			},
		});

		expect(
			mergeConfigSources(
				root,
				'@autoguru/fls-booking',
				'prod',
				'nz',
			),
		).toEqual({ baseUrl: 'https://app' });
	});
});
