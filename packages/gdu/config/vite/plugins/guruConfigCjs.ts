import type { VitePlugin } from '../types';

/**
 * Transforms CJS guru.config.js files into ESM-compatible modules.
 *
 * guru.config.js uses `module.exports = { ... }` which Vite's dev server
 * (esbuild) handles natively but Rollup's production build does NOT —
 * Rollup only maps `module.exports` to a default export, leaving named
 * imports (e.g. `import * as config from '../guru.config'`) as `undefined`.
 *
 * This plugin wraps the CJS code so both default and named exports work
 * in dev and production builds.
 */
export function guruConfigCjsPlugin(): VitePlugin {
	return {
		name: 'gdu-guru-config-cjs',
		transform(code, id) {
			if (!id.endsWith('guru.config.js')) return null;

			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const config = require(id);
			const keys = Object.keys(config);

			const lines = [
				'const __cjs = {};',
				'const module = { get exports() { return __cjs; }, set exports(v) { Object.assign(__cjs, v); } };',
				code,
				'export default __cjs;',
				...keys.map(
					(k) => `export const ${k} = __cjs[${JSON.stringify(k)}];`,
				),
			];

			return { code: lines.join('\n'), map: null };
		},
	};
}
