import type { VitePlugin } from '../types';

/**
 * Prevents Rolldown from constant-folding Octopus deploy tokens across chunks.
 *
 * Problem: Vite's `define` replaces `process.env.XXX` with a string literal
 * (e.g. `"#{IS_PRODUCTION}"`). Rolldown then inlines that literal into every
 * consumer chunk, scattering tokens across dozens of files. The CI/CD
 * `tokenReplacement.sh` only processes the `mfe-configs` chunk, so scattered
 * tokens remain un-replaced at runtime.
 *
 * Solution: This plugin runs before `define` (`enforce: 'pre'`) and rewrites
 * `process.env.XXX` → `globalThis.__MFE_ENV__["XXX"]`. Dynamic property access
 * cannot be constant-folded, so all tokens stay inside the `mfe-configs` chunk
 * where `tokenReplacement.sh` can find them.
 */
export function mfeEnvTokens(envTokens: Record<string, string>): VitePlugin {
	const keys = Object.keys(envTokens);
	if (keys.length === 0) {
		return { name: 'gdu-mfe-env-tokens' };
	}

	const escapedKeys = keys.map((k) =>
		k.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`),
	);
	const pattern = new RegExp(
		`\\bprocess\\.env\\.(${escapedKeys.join('|')})\\b`,
		'g',
	);

	const initEntries = keys
		.map((key) => `${JSON.stringify(key)}:${envTokens[key]}`)
		.join(',');
	const initCode = `globalThis.__MFE_ENV__={${initEntries}};`;

	return {
		name: 'gdu-mfe-env-tokens',
		apply: 'build',
		enforce: 'pre',

		transform(code) {
			if (!code.includes('process.env.')) return null;

			const result = code.replace(
				pattern,
				(_, key) => `globalThis.__MFE_ENV__[${JSON.stringify(key)}]`,
			);

			return result === code ? null : { code: result, map: null };
		},

		renderChunk(code, chunk) {
			if (!chunk.fileName.includes('mfe-configs')) return null;
			return { code: initCode + code, map: null };
		},
	};
}
