import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface EnvTenantCombo {
	env: string;
	tenant: 'au' | 'nz';
}

const TENANTS: ReadonlyArray<'au' | 'nz'> = ['au', 'nz'];

/**
 * Strips the `@autoguru/` scope so a scoped package name (`getProjectName()`)
 * matches the bare keys used in `.mfe-data/mfe-list.json`.
 */
export function toBareAppName(appName: string): string {
	return appName.replace(/^@autoguru\//, '');
}

function readJson(filePath: string): Record<string, unknown> | null {
	if (!existsSync(filePath)) return null;
	try {
		return JSON.parse(readFileSync(filePath, 'utf8'));
	} catch (error) {
		// A malformed committed config must surface at build time — an absent
		// file is legitimate (returns null quietly above), but a parse failure
		// would otherwise silently bake an empty __MFE_ENV__.
		console.warn(`[mfeDataReader] Failed to parse ${filePath}:`, error);
		return null;
	}
}

/**
 * Resolves the env×tenant combos an SPA targets from `.mfe-data/mfe-list.json`
 * (keyed `type → app → {au|nz: [envs]}`). Reads the matrix per app — never
 * hardcodes it — so outliers (NZ-only, AU+NZ-full, global/shared-only) resolve
 * to exactly what the list declares. An app with no `au`/`nz` keys (e.g. the
 * global-only `mfe-manager`) yields no combos and emits no config chunks.
 */
export function resolveCombosForApp(
	appName: string,
	workspaceRoot: string,
): EnvTenantCombo[] {
	const bareName = toBareAppName(appName);
	const mfeList = readJson(join(workspaceRoot, '.mfe-data', 'mfe-list.json'));
	const spaEntry = (mfeList?.spa as Record<string, unknown> | undefined)?.[
		bareName
	] as Record<string, unknown> | undefined;

	if (!spaEntry) return [];

	const combos: EnvTenantCombo[] = [];
	for (const tenant of TENANTS) {
		const envs = spaEntry[tenant];
		if (!Array.isArray(envs)) continue;
		for (const env of envs) {
			if (typeof env === 'string') combos.push({ env, tenant });
		}
	}
	return combos;
}

/**
 * Merges the real per-env/tenant config values a build bakes into
 * `globalThis.__MFE_ENV__` for one combo, in precedence order (later wins):
 * `.mfe-data/env-configs/{env}_{tenant}.json` (global config values) then
 * `.mfe-data/app-configs/<app>/{env}_{tenant}.json` (app infra overrides).
 *
 * When `allowKeys` is supplied the result is restricted to those keys — the
 * set the application actually reads (the `process.env.*` tokens rewritten by
 * `mfeEnvTokens`). This keeps CDK-only infra keys out of the browser bundle and
 * guarantees every rewritten read resolves to a value.
 */
export function mergeConfigSources(
	workspaceRoot: string,
	appName: string,
	env: string,
	tenant: string,
	allowKeys?: ReadonlyArray<string>,
): Record<string, unknown> {
	const bareName = toBareAppName(appName);
	const dataRoot = join(workspaceRoot, '.mfe-data');
	const combo = `${env}_${tenant}.json`;

	const merged: Record<string, unknown> = {
		...readJson(join(dataRoot, 'env-configs', combo)),
		...readJson(join(dataRoot, 'app-configs', bareName, combo)),
	};

	if (!allowKeys) return merged;

	const allow = new Set(allowKeys);
	const filtered: Record<string, unknown> = {};
	for (const key of Object.keys(merged)) {
		if (allow.has(key)) filtered[key] = merged[key];
	}
	return filtered;
}
