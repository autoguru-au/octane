import { Buffer } from 'node:buffer';

import type { LoaderDefinitionFunction } from 'webpack';

const REFRESH_STUB = `
;(function() {
  if (typeof globalThis.$RefreshSig$ === "undefined") {
    globalThis.$RefreshSig$ = function() { return function(type) { return type; }; };
  }
  if (typeof globalThis.$RefreshReg$ === "undefined") {
    globalThis.$RefreshReg$ = function() {};
  }
})();
`;

const isSkippableLine = (line: string): boolean =>
	line === '' ||
	line.startsWith('//') ||
	line === '"use strict";' ||
	line === "'use strict';";

const isImportStart = (line: string): boolean =>
	line.startsWith('import ') || line.startsWith('import{');

const isImportEnd = (line: string): boolean =>
	line.endsWith(';') || line.endsWith("';") || line.endsWith('";');

const isExportLine = (line: string): boolean =>
	line.startsWith('export *') || line.startsWith('export {');

const isMultilineCommentStart = (line: string): boolean => {
	if (!line.startsWith('/*')) return false;
	return !line.includes('*/') || line.indexOf('/*') > line.indexOf('*/');
};

const sourceToString = (source: string | Buffer): string => {
	if (typeof source === 'string') return source;
	if (Buffer.isBuffer(source)) return source.toString('utf8');
	return '';
};

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

	const sourceString = sourceToString(source);
	const lines = sourceString.split('\n');
	let insertIndex = 0;
	let inMultilineComment = false;
	let inMultilineImport = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Handle multiline comments
		if (inMultilineComment) {
			insertIndex = i + 1;
			if (line.includes('*/')) inMultilineComment = false;
			continue;
		}

		if (line.startsWith('/*')) {
			insertIndex = i + 1;
			inMultilineComment = isMultilineCommentStart(line);
			continue;
		}

		// Handle multiline imports
		if (inMultilineImport) {
			insertIndex = i + 1;
			// Check if this line ends the import (has semicolon or } from '...')
			if (
				isImportEnd(line) ||
				line.startsWith("} from '") ||
				line.startsWith('} from "')
			) {
				inMultilineImport = false;
			}
			continue;
		}

		// Check for import start
		if (isImportStart(line)) {
			insertIndex = i + 1;
			// Check if it's a single-line import (ends with semicolon)
			if (!isImportEnd(line)) {
				inMultilineImport = true;
			}
			continue;
		}

		// Handle skippable lines and exports
		if (isSkippableLine(line) || isExportLine(line)) {
			insertIndex = i + 1;
			continue;
		}

		// Non-import, non-comment, non-skippable line found - stop here
		break;
	}

	lines.splice(insertIndex, 0, REFRESH_STUB);
	return lines.join('\n');
};

export default vanillaExtractRefreshStubLoader;
