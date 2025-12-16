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

const isImportLine = (line: string): boolean =>
	line.startsWith('import ') ||
	line.startsWith('import{') ||
	line.startsWith("} from '") ||
	line.startsWith('} from "');

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

	for (const [i, line_] of lines.entries()) {
		const line = line_.trim();

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

		if (
			isSkippableLine(line) ||
			isImportLine(line) ||
			isExportLine(line)
		) {
			insertIndex = i + 1;
			continue;
		}

		break;
	}

	lines.splice(insertIndex, 0, REFRESH_STUB);
	return lines.join('\n');
};

export default vanillaExtractRefreshStubLoader;
