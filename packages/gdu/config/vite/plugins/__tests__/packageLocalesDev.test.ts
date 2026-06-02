import {
	mkdtempSync,
	mkdirSync,
	rmSync,
	writeFileSync,
	readFileSync,
	existsSync,
} from 'fs';
import { tmpdir } from 'os';
import path from 'path';

import {
	copyPackageLocalesForDev,
	packageLocalesDevPlugin,
} from '../packageLocalesDev';

interface PackageSpec {
	dir: string;
	i18n?: { namespaces?: string[]; localesPath?: string };
	locales: Record<string, Record<string, unknown>>; // locale -> filename(without .json) -> json
}

function writePackage(workspaceRoot: string, spec: PackageSpec): void {
	const pkgPath = path.join(workspaceRoot, 'packages', spec.dir);
	mkdirSync(pkgPath, { recursive: true });
	writeFileSync(
		path.join(pkgPath, 'package.json'),
		JSON.stringify({
			name: `@autoguru/${spec.dir}`,
			...(spec.i18n ? { i18n: spec.i18n } : {}),
		}),
	);
	const localesRoot = path.join(pkgPath, spec.i18n?.localesPath ?? 'locales');
	for (const [locale, files] of Object.entries(spec.locales)) {
		const localeDir = path.join(localesRoot, locale);
		mkdirSync(localeDir, { recursive: true });
		for (const [name, json] of Object.entries(files)) {
			writeFileSync(
				path.join(localeDir, `${name}.json`),
				JSON.stringify(json),
			);
		}
	}
}

function readTarget(
	appDir: string,
	locale: string,
	ns: string,
): Record<string, unknown> {
	return JSON.parse(
		readFileSync(
			path.join(appDir, 'public', 'locales', locale, `${ns}.json`),
			'utf8',
		),
	);
}

describe('copyPackageLocalesForDev', () => {
	let workspaceRoot: string;
	let appDir: string;

	beforeEach(() => {
		const base = mkdtempSync(path.join(tmpdir(), 'gdu-locales-'));
		workspaceRoot = path.join(base, 'workspace');
		appDir = path.join(base, 'app');
		mkdirSync(path.join(workspaceRoot, 'packages'), { recursive: true });
		mkdirSync(appDir, { recursive: true });
	});

	afterEach(() => {
		rmSync(path.dirname(workspaceRoot), { recursive: true, force: true });
	});

	it('copies declared package locales into the app public/locales for every locale', async () => {
		writePackage(workspaceRoot, {
			dir: 'fleet-supplier-info',
			i18n: { namespaces: ['pkg-fleet-supplier-ui'] },
			locales: {
				en: { 'pkg-fleet-supplier-ui': { greeting: 'Hello' } },
				de: { 'pkg-fleet-supplier-ui': { greeting: 'Hallo' } },
			},
		});

		const result = await copyPackageLocalesForDev({
			workspaceRoot,
			appDir,
		});

		expect(readTarget(appDir, 'en', 'pkg-fleet-supplier-ui')).toEqual({
			greeting: 'Hello',
		});
		expect(readTarget(appDir, 'de', 'pkg-fleet-supplier-ui')).toEqual({
			greeting: 'Hallo',
		});
		expect(result).toEqual({ packages: 1, files: 2 });
	});

	it('only copies namespaces declared in the package i18n.namespaces filter', async () => {
		writePackage(workspaceRoot, {
			dir: 'fleet-supplier-info',
			i18n: { namespaces: ['pkg-fleet-supplier-ui'] },
			locales: {
				en: {
					'pkg-fleet-supplier-ui': { greeting: 'Hello' },
					'pkg-internal-only': { secret: 'nope' },
				},
			},
		});

		await copyPackageLocalesForDev({ workspaceRoot, appDir });

		expect(
			existsSync(
				path.join(
					appDir,
					'public/locales/en/pkg-fleet-supplier-ui.json',
				),
			),
		).toBe(true);
		expect(
			existsSync(
				path.join(appDir, 'public/locales/en/pkg-internal-only.json'),
			),
		).toBe(false);
	});

	it('prefixes unprefixed namespaces with pkg-<packageName> when no filter is declared', async () => {
		writePackage(workspaceRoot, {
			dir: 'widgets',
			locales: { en: { widgets: { label: 'Widget' } } },
		});

		await copyPackageLocalesForDev({ workspaceRoot, appDir });

		expect(readTarget(appDir, 'en', 'pkg-widgets')).toEqual({
			label: 'Widget',
		});
	});

	it('skips locales listed in excludeLocales', async () => {
		writePackage(workspaceRoot, {
			dir: 'fleet-supplier-info',
			i18n: { namespaces: ['pkg-fleet-supplier-ui'] },
			locales: {
				en: { 'pkg-fleet-supplier-ui': { greeting: 'Hello' } },
				de: { 'pkg-fleet-supplier-ui': { greeting: 'Hallo' } },
			},
		});

		await copyPackageLocalesForDev({
			workspaceRoot,
			appDir,
			excludeLocales: ['de'],
		});

		expect(
			existsSync(
				path.join(
					appDir,
					'public/locales/en/pkg-fleet-supplier-ui.json',
				),
			),
		).toBe(true);
		expect(
			existsSync(
				path.join(
					appDir,
					'public/locales/de/pkg-fleet-supplier-ui.json',
				),
			),
		).toBe(false);
	});

	it('returns zero counts and writes nothing when the workspace has no packages directory', async () => {
		const emptyWorkspace = path.join(path.dirname(workspaceRoot), 'empty');
		mkdirSync(emptyWorkspace, { recursive: true });

		const result = await copyPackageLocalesForDev({
			workspaceRoot: emptyWorkspace,
			appDir,
		});

		expect(result).toEqual({ packages: 0, files: 0 });
		expect(existsSync(path.join(appDir, 'public', 'locales'))).toBe(false);
	});
});

describe('packageLocalesDevPlugin', () => {
	let workspaceRoot: string;
	let appDir: string;

	beforeEach(() => {
		const base = mkdtempSync(path.join(tmpdir(), 'gdu-locales-plugin-'));
		workspaceRoot = path.join(base, 'workspace');
		appDir = path.join(base, 'app');
		mkdirSync(path.join(workspaceRoot, 'packages'), { recursive: true });
		mkdirSync(appDir, { recursive: true });
	});

	afterEach(() => {
		rmSync(path.dirname(workspaceRoot), { recursive: true, force: true });
	});

	it('copies package locales when its configureServer hook runs', async () => {
		writePackage(workspaceRoot, {
			dir: 'fleet-supplier-info',
			i18n: { namespaces: ['pkg-fleet-supplier-ui'] },
			locales: { en: { 'pkg-fleet-supplier-ui': { greeting: 'Hello' } } },
		});

		const plugin = packageLocalesDevPlugin({ workspaceRoot, appDir });
		// configureServer ignores the server arg in this plugin.
		await (plugin.configureServer as () => Promise<void>)();

		expect(readTarget(appDir, 'en', 'pkg-fleet-supplier-ui')).toEqual({
			greeting: 'Hello',
		});
		expect(plugin.name).toBe('gdu-package-locales-dev');
	});

	it('does not throw when discovery fails for a missing workspace', async () => {
		const plugin = packageLocalesDevPlugin({
			workspaceRoot: path.join(workspaceRoot, 'does-not-exist'),
			appDir,
		});

		await expect(
			(plugin.configureServer as () => Promise<void>)(),
		).resolves.toBeUndefined();
	});
});
