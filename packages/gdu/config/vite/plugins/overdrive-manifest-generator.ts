/**
 * Generates overdrive-export-manifest.ts by parsing the barrel export structure
 * of @autoguru/overdrive. Run this script whenever Overdrive is updated to
 * regenerate the manifest.
 *
 * Usage: npx tsx packages/gdu/config/vite/plugins/overdrive-manifest-generator.ts [--overdrive-path <path>]
 *
 * Defaults to resolving @autoguru/overdrive from node_modules.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

interface ManifestEntry {
	path: string;
	originalName?: string;
}

type Manifest = Record<string, ManifestEntry>;

type OverdriveCategory = 'components' | 'hooks' | 'styles' | 'themes' | 'utils';

const RE_EXPORT_NAMED =
	/export\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g;

function parseReExports(
	source: string,
): Array<{ names: Array<{ exported: string; local: string }>; from: string }> {
	const results: Array<{
		names: Array<{ exported: string; local: string }>;
		from: string;
	}> = [];

	for (const match of source.matchAll(RE_EXPORT_NAMED)) {
		const namesStr = match[1];
		const fromPath = match[2];

		const names = namesStr.split(',').map((part) => {
			const trimmed = part.trim();
			const asMatch = /^([a-zA-Z_$][\w$]*)\s+as\s+([a-zA-Z_$][\w$]*)$/.exec(trimmed);
			if (asMatch) {
				return { local: asMatch[1], exported: asMatch[2] };
			}
			return { local: trimmed, exported: trimmed };
		});

		results.push({ names, from: fromPath });
	}

	return results;
}

function resolveDeepPath(
	relativePath: string,
	category: OverdriveCategory,
): string {
	const base = `@autoguru/overdrive/${category}`;

	if (category === 'components') {
		const dirMatch = /\.\/(\w+)\/index\.js$/.exec(relativePath);
		if (dirMatch) return `${base}/${dirMatch[1]}`;
	}

	if (category === 'hooks') {
		const dirMatch = /\.\/(\w+)\/index\.js$/.exec(relativePath);
		if (dirMatch) return `${base}/${dirMatch[1]}`;
	}

	if (category === 'styles') {
		const fileMatch = /\.\/(.+?)\.js$/.exec(relativePath);
		if (fileMatch) return `${base}/${fileMatch[1]}`;
		return base;
	}

	if (category === 'themes') {
		const fileMatch = /\.\/(.+?)\.js$/.exec(relativePath);
		if (fileMatch) return `${base}/${fileMatch[1]}`;
		return base;
	}

	return base;
}

function processBarrelFile(
	filePath: string,
	category: OverdriveCategory,
): Manifest {
	const manifest: Manifest = {};
	const source = fs.readFileSync(filePath, 'utf8');
	const reExports = parseReExports(source);

	for (const { names, from: fromPath } of reExports) {
		const deepPath = resolveDeepPath(fromPath, category);
		for (const { exported, local } of names) {
			manifest[exported] = { path: deepPath };
			if (local !== exported) {
				manifest[exported].originalName = local;
			}
		}
	}

	return manifest;
}

const CATEGORY_PREFIXES: Array<[string, OverdriveCategory]> = [
	['./components/', 'components'],
	['./hooks/', 'hooks'],
	['./styles/', 'styles'],
	['./themes/', 'themes'],
	['./utils/', 'utils'],
];

const BARREL_RE_EXPORTS = new Set([
	'./components/index.js',
	'./hooks/index.js',
	'./styles/index.js',
]);

function detectCategory(fromPath: string): OverdriveCategory | undefined {
	for (const [prefix, category] of CATEGORY_PREFIXES) {
		if (fromPath.startsWith(prefix)) return category;
	}
	return undefined;
}

function processTopLevelBarrel(filePath: string): {
	manifest: Manifest;
} {
	const manifest: Manifest = {};
	const source = fs.readFileSync(filePath, 'utf8');
	const reExports = parseReExports(source);

	for (const { names, from: fromPath } of reExports) {
		const category = detectCategory(fromPath);
		if (!category) continue;
		if (BARREL_RE_EXPORTS.has(fromPath)) continue;

		for (const { exported, local } of names) {
			const deepPath = resolveDeepPath(fromPath, category);
			manifest[exported] = { path: deepPath };
			if (local !== exported) {
				manifest[exported].originalName = local;
			}
		}
	}

	return { manifest };
}

function generateManifestSource(manifest: Manifest): string {
	const entries = Object.entries(manifest);
	const lines: string[] = [];

	lines.push(`/**`);
	lines.push(` * Auto-generated manifest mapping every named export from \`@autoguru/overdrive\``);
	lines.push(` * to its deep import path. Used by the Vite barrel-splitting plugin to rewrite`);
	lines.push(` * barrel imports into granular deep imports for optimal tree-shaking.`);
	lines.push(` *`);
	lines.push(` * Regenerate with: npx tsx packages/gdu/config/vite/plugins/overdrive-manifest-generator.ts`);
	lines.push(` *`);
	lines.push(` * Total exports: ${entries.length}`);
	lines.push(` */`);
	lines.push('');
	lines.push('interface OverdriveExportEntry {');
	lines.push('\tpath: string;');
	lines.push('\toriginalName?: string;');
	lines.push('}');
	lines.push('');
	lines.push('export const OVERDRIVE_EXPORT_MANIFEST: Record<');
	lines.push('\tstring,');
	lines.push('\tOverdriveExportEntry');
	lines.push('> = {');

	for (const [name, entry] of entries) {
		const key = JSON.stringify(name);
		const pathLiteral = JSON.stringify(entry.path);

		if (entry.originalName) {
			const originalNameLiteral = JSON.stringify(entry.originalName);
			lines.push(
				`\t${key}: { path: ${pathLiteral}, originalName: ${originalNameLiteral} },`,
			);
		} else {
			lines.push(`\t${key}: { path: ${pathLiteral} },`);
		}
	}

	lines.push('} as const;');
	lines.push('');
	lines.push("export const OVERDRIVE_PACKAGE = '@autoguru/overdrive' as const;");
	lines.push('');
	lines.push('export const OVERDRIVE_EXPORT_COUNT = Object.keys(');
	lines.push('\tOVERDRIVE_EXPORT_MANIFEST,');
	lines.push(').length;');
	lines.push('');

	return lines.join('\n');
}

function main() {
	const args = process.argv.slice(2);
	let overdrivePath: string;

	const pathArgIndex = args.indexOf('--overdrive-path');
	if (pathArgIndex !== -1 && args[pathArgIndex + 1]) {
		overdrivePath = path.resolve(args[pathArgIndex + 1]);
	} else {
		try {
			const pkgPath = require.resolve('@autoguru/overdrive/package.json');
			overdrivePath = path.dirname(pkgPath);
		} catch {
			console.error(
				'Could not resolve @autoguru/overdrive. Use --overdrive-path to specify the package location.',
			);
			process.exit(1);
		}
	}

	const distPath = path.join(overdrivePath, 'dist');

	if (!fs.existsSync(distPath)) {
		console.error(`Overdrive dist not found at: ${distPath}`);
		process.exit(1);
	}

	console.log(`Reading Overdrive exports from: ${distPath}`);

	const manifest: Manifest = {};

	// 1. Parse component sub-barrel
	const componentsBarrel = path.join(distPath, 'components', 'index.js');
	if (fs.existsSync(componentsBarrel)) {
		const componentManifest = processBarrelFile(
			componentsBarrel,
			'components',
		);
		Object.assign(manifest, componentManifest);
		console.log(
			`  Components: ${Object.keys(componentManifest).length} exports`,
		);
	}

	// 2. Parse hook sub-barrel
	const hooksBarrel = path.join(distPath, 'hooks', 'index.js');
	if (fs.existsSync(hooksBarrel)) {
		const hookManifest = processBarrelFile(hooksBarrel, 'hooks');
		Object.assign(manifest, hookManifest);
		console.log(`  Hooks: ${Object.keys(hookManifest).length} exports`);
	}

	// 3. Parse style sub-barrel (for direct style exports)
	const stylesBarrel = path.join(distPath, 'styles', 'index.js');
	if (fs.existsSync(stylesBarrel)) {
		const styleManifest = processBarrelFile(stylesBarrel, 'styles');
		Object.assign(manifest, styleManifest);
		console.log(`  Styles: ${Object.keys(styleManifest).length} exports`);
	}

	// 4. Parse top-level barrel for aliases and utils
	const topBarrel = path.join(distPath, 'index.js');
	if (fs.existsSync(topBarrel)) {
		const { manifest: topManifest } =
			processTopLevelBarrel(topBarrel);
		Object.assign(manifest, topManifest);
		console.log(
			`  Aliases & utils: ${Object.keys(topManifest).length} exports`,
		);
	}

	console.log(`\nTotal manifest entries: ${Object.keys(manifest).length}`);

	// Write the manifest file
	const outputPath = path.join(__dirname, 'overdrive-export-manifest.ts');
	const source = generateManifestSource(manifest);
	fs.writeFileSync(outputPath, source, 'utf8');
	console.log(`\nManifest written to: ${outputPath}`);
}

main();
