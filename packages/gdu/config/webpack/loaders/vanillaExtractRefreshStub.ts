import type { LoaderDefinitionFunction } from 'webpack';

/**
 * Webpack loader that injects React Fast Refresh stubs into vanilla-extract CSS files.
 * This is needed because Vanilla Extract's child compiler evaluates .css.ts/.css.js files
 * in a context where $RefreshSig$ and $RefreshReg$ are not defined, causing runtime errors.
 *
 * The stubs are inserted AFTER all import statements to preserve ES module syntax validity.
 */
const vanillaExtractRefreshStubLoader: LoaderDefinitionFunction = function (
	source: string | Buffer,
) {
	this.cacheable?.();

	let sourceString = '';
	if (typeof source === 'string') {
		sourceString = source;
	} else if (Buffer.isBuffer(source)) {
		sourceString = source.toString('utf8');
	}

	const refreshStub = `
;(function() {
  if (typeof globalThis.$RefreshSig$ === "undefined") {
    globalThis.$RefreshSig$ = function() { return function(type) { return type; }; };
  }
  if (typeof globalThis.$RefreshReg$ === "undefined") {
    globalThis.$RefreshReg$ = function() {};
  }
})();
`;

	// Find the position after all import/export statements at the top of the file
	// This preserves ES module syntax which requires imports at the top
	const lines = sourceString.split('\n');
	let insertIndex = 0;
	let inMultilineComment = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Track multiline comment state
		if (inMultilineComment) {
			insertIndex = i + 1;
			if (line.includes('*/')) {
				inMultilineComment = false;
			}
			continue;
		}

		// Check for multiline comment start
		if (line.startsWith('/*')) {
			insertIndex = i + 1;
			// Check if comment ends on same line
			if (!line.includes('*/') || line.indexOf('/*') > line.indexOf('*/')) {
				inMultilineComment = true;
			}
			continue;
		}

		// Skip empty lines, single-line comments, and 'use strict'
		if (
			line === '' ||
			line.startsWith('//') ||
			line === '"use strict";' ||
			line === "'use strict';"
		) {
			insertIndex = i + 1;
			continue;
		}

		// Continue past import statements
		if (line.startsWith('import ') || line.startsWith('import{')) {
			insertIndex = i + 1;
			continue;
		}

		// Continue past multiline imports (lines that are part of an import block)
		if (line.startsWith("} from '") || line.startsWith('} from "')) {
			insertIndex = i + 1;
			continue;
		}

		// Continue past export * statements
		if (line.startsWith('export *') || line.startsWith('export {')) {
			insertIndex = i + 1;
			continue;
		}

		// Found first non-import line
		break;
	}

	// Insert the stub after all imports
	lines.splice(insertIndex, 0, refreshStub);
	return lines.join('\n');
};

export default vanillaExtractRefreshStubLoader;
