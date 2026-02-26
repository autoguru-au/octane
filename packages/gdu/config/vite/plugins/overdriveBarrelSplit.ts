import type { VitePlugin } from '../types';
import {
	OVERDRIVE_EXPORT_MANIFEST,
	OVERDRIVE_PACKAGE,
} from './overdrive-export-manifest';

interface ImportSpecifier {
	imported: string;
	local: string;
	isType: boolean;
}

/**
 * Rewrites barrel imports from `@autoguru/overdrive` into deep component
 * imports using the export manifest, enabling granular tree-shaking and
 * avoiding Vanilla Extract CSS side-effect leakage from unused components.
 *
 * Before:
 *   import { Box, Button, tokens } from '@autoguru/overdrive';
 *
 * After:
 *   import { Box } from '@autoguru/overdrive/components/Box';
 *   import { Button } from '@autoguru/overdrive/components/Button';
 *   import { overdriveTokens as tokens } from '@autoguru/overdrive/themes/theme.css';
 */
export function overdriveBarrelSplit(): VitePlugin {
	// Matches named imports from bare '@autoguru/overdrive' (not subpaths).
	// Groups: [1] optional "type ", [2] specifier list, [3] quote character
	const importRegex =
		/import\s+(type\s+)?\{([^}]+)\}\s*from\s*(['"])@autoguru\/overdrive\3\s*;?/g;

	return {
		name: 'gdu-overdrive-barrel-split',
		enforce: 'pre',
		apply: 'build',

		transform(code, id) {
			if (!/\.[jt]sx?$/.test(id)) return null;
			if (id.includes('node_modules')) return null;
			if (!code.includes(OVERDRIVE_PACKAGE)) return null;

			let hasMatch = false;

			const result = code.replace(
				importRegex,
				(match, typeModifier: string | undefined, specifiersStr: string, quote: string) => {
					const isTypeOnly = Boolean(typeModifier);
					const specifiers = parseSpecifiers(specifiersStr);

					if (specifiers.length === 0) return match;

					// Group resolved specifiers by deep path; collect unresolved as residual
					const grouped = new Map<
						string,
						Array<{ local: string; imported: string; isType: boolean }>
					>();
					const residual: typeof specifiers = [];

					for (const spec of specifiers) {
						const entry = OVERDRIVE_EXPORT_MANIFEST[spec.imported];
						if (entry) {
							const key = entry.path;
							if (!grouped.has(key)) grouped.set(key, []);
							grouped.get(key)!.push({
								local: spec.local,
								imported: entry.originalName ?? spec.imported,
								isType: spec.isType || isTypeOnly,
							});
						} else {
							residual.push(spec);
						}
					}

					// Nothing resolved — leave the import untouched
					if (grouped.size === 0) return match;

					hasMatch = true;

					const imports: string[] = [];

					for (const [deepPath, specs] of grouped) {
						const allTypes = specs.every((s) => s.isType);
						const typePrefix = allTypes ? 'type ' : '';
						const specifierList = specs
							.map((s) => {
								const inlineType =
									!typePrefix && s.isType ? 'type ' : '';
								return s.imported === s.local
									? `${inlineType}${s.imported}`
									: `${inlineType}${s.imported} as ${s.local}`;
							})
							.join(', ');
						imports.push(
							`import ${typePrefix}{ ${specifierList} } from ${quote}${deepPath}${quote};`,
						);
					}

					// Residual: specifiers not found in the manifest stay on a barrel import
					if (residual.length > 0) {
						const allTypes =
							isTypeOnly || residual.every((s) => s.isType);
						const typePrefix = allTypes ? 'type ' : '';
						const specifierList = residual
							.map((s) => {
								const inlineType =
									!typePrefix && s.isType ? 'type ' : '';
								return s.imported === s.local
									? `${inlineType}${s.imported}`
									: `${inlineType}${s.imported} as ${s.local}`;
							})
							.join(', ');
						imports.push(
							`import ${typePrefix}{ ${specifierList} } from ${quote}${OVERDRIVE_PACKAGE}${quote};`,
						);
					}

					return imports.join('\n');
				},
			);

			return hasMatch ? { code: result, map: null } : null;
		},
	};
}

function parseSpecifiers(raw: string): ImportSpecifier[] {
	return raw
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => {
			let isType = false;
			let cleaned = part;

			// Inline `type` modifier: `type Foo` or `type Foo as Bar`
			if (/^type\s+/.test(cleaned)) {
				isType = true;
				cleaned = cleaned.replace(/^type\s+/, '');
			}

			const asMatch = /^(\S+)\s+as\s+(\S+)$/.exec(cleaned);
			if (asMatch) {
				return { imported: asMatch[1], local: asMatch[2], isType };
			}
			return { imported: cleaned, local: cleaned, isType };
		});
}
