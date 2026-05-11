import fs from 'fs';
import path from 'path';

import type { VitePlugin } from '../types';

/**
 * Rolldown CJS Interop Shim for ESM External Modules
 *
 * When Rolldown bundles CJS code that `require()`s external modules, it emits
 * a CJS runtime helper that calls `require()` — which doesn't exist in browsers.
 * The built-in `esmExternalRequirePlugin` handles module-boundary conversion but
 * does not transform require calls inside Rolldown's own CJS wrapper functions.
 *
 * This plugin creates a thin wrapper entry that pre-loads all external modules
 * via dynamic `import()` and defines a synchronous `globalThis.require()` from
 * cache, then dynamically imports the real entry. Uses top-level await (ES2022).
 *
 * Why writeBundle instead of renderChunk:
 * ES module static `import` declarations are always hoisted and evaluated before
 * the module body runs. The previous renderChunk approach prepended the shim to
 * the entry chunk, but the entry's static imports (hooks, i18n, helpers, etc.)
 * would evaluate first — triggering `require()` calls before the shim was set up.
 * By emitting a separate wrapper with NO static imports, we guarantee the shim
 * executes before any chunk evaluation.
 *
 * Safety: The shim is harmless if `require()` is never called — it defines globals
 * that simply go unused. The early return when `externals` is empty prevents any
 * injection for standalone builds.
 *
 * CDN resilience: Uses `Promise.allSettled()` so a single CDN failure does not
 * blank the page. Successfully loaded modules are cached; failed ones log errors.
 *
 * Multi-MFE safety: If `globalThis.require` already exists (from another Vite MFE
 * on the same page), the shim chains to the existing function rather than
 * overwriting it, preserving the previous MFE's module cache.
 *
 * Constraint: Rolldown is the chosen bundler — no downgrade to Rollup is permitted.
 */
export function rolldownExternalShim(
	externals: Record<string, string>,
): VitePlugin {
	const externalUrls = Object.values(externals);

	if (externalUrls.length === 0) {
		return { name: 'rolldown-external-shim' };
	}

	const shim = buildShimSource(externalUrls);

	return {
		name: 'rolldown-external-shim',
		apply: 'build',

		writeBundle(options, bundle) {
			const outputDir = options.dir;
			if (!outputDir) return;

			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (chunk.type !== 'chunk' || !chunk.isEntry) continue;

				const innerFileName = deriveInnerFileName(fileName);
				relocateEntryToInner(outputDir, fileName, innerFileName, shim);
				rewriteChunkImports(
					outputDir,
					bundle,
					fileName,
					innerFileName,
				);
			}
		},
	};
}

function buildShimSource(externalUrls: string[]): string {
	const preloads = externalUrls
		.map(
			(url) =>
				`import(${JSON.stringify(url)}).then(function(m){__xrc[${JSON.stringify(url)}]=m}).catch(function(e){console.error("[rolldown-shim] Failed:",${JSON.stringify(url)},e)})`,
		)
		.join(',');

	return [
		`var __xrc={};`,
		`await Promise.allSettled([${preloads}]);`,
		`var __prev=typeof globalThis.require==="function"?globalThis.require:null;`,
		`globalThis.require=function(id){`,
		`if(__xrc[id])return __xrc[id];`,
		`if(__prev)return __prev(id);`,
		`console.error("[rolldown-shim] Unknown module:",id);`,
		`return{}};`,
	].join('');
}

function deriveInnerFileName(fileName: string): string {
	return fileName.replace(/(-[a-zA-Z0-9_-]+)?\.js$/, '-inner$1.js');
}

// The wrapper has zero static imports so the shim executes before any chunk
// evaluation. The original entry code is moved verbatim to an `-inner` sibling
// and dynamically imported from the wrapper.
function relocateEntryToInner(
	outputDir: string,
	fileName: string,
	innerFileName: string,
	shim: string,
): void {
	const entryPath = path.join(outputDir, fileName);
	const innerPath = path.join(outputDir, innerFileName);

	const originalCode = fs.readFileSync(entryPath, 'utf8');
	fs.writeFileSync(innerPath, originalCode);

	moveSourceMapIfPresent(entryPath, innerPath);

	fs.writeFileSync(
		entryPath,
		`${shim}\nawait import("./${innerFileName}");`,
	);
}

function moveSourceMapIfPresent(entryPath: string, innerPath: string): void {
	const mapPath = `${entryPath}.map`;
	if (!fs.existsSync(mapPath)) return;

	try {
		fs.renameSync(mapPath, `${innerPath}.map`);
	} catch {
		fs.copyFileSync(mapPath, `${innerPath}.map`);
		fs.unlinkSync(mapPath);
	}
}

// Rewrite chunks that import from the original entry to import from the inner
// file instead. The wrapper has no exports, so any chunk doing
// `import {x} from "../main.js"` would otherwise break.
function rewriteChunkImports(
	outputDir: string,
	bundle: Record<string, unknown>,
	fileName: string,
	innerFileName: string,
): void {
	for (const [chunkFile, chunkItem] of Object.entries(bundle)) {
		if (!isNonEntryChunk(chunkItem)) continue;

		const chunkPath = path.join(outputDir, chunkFile);
		if (!fs.existsSync(chunkPath)) continue;

		const chunkCode = fs.readFileSync(chunkPath, 'utf8');
		if (!chunkCode.includes(fileName)) continue;

		const updated = rewriteEntryReference(
			chunkCode,
			chunkFile,
			fileName,
			innerFileName,
		);

		if (updated !== chunkCode) {
			fs.writeFileSync(chunkPath, updated);
		}
	}
}

function isNonEntryChunk(
	chunkItem: unknown,
): chunkItem is { type: 'chunk'; isEntry: boolean } {
	if (typeof chunkItem !== 'object' || chunkItem === null) return false;
	const candidate = chunkItem as { type?: unknown; isEntry?: unknown };
	return candidate.type === 'chunk' && candidate.isEntry === false;
}

function rewriteEntryReference(
	chunkCode: string,
	chunkFile: string,
	fileName: string,
	innerFileName: string,
): string {
	const chunkDir = path.dirname(chunkFile);
	const relToEntry = path.posix.relative(chunkDir, fileName);
	const relToInner = path.posix.relative(chunkDir, innerFileName);

	return chunkCode.split(relToEntry).join(relToInner);
}
