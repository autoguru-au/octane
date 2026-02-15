import { existsSync, readFileSync } from 'fs';
import { dirname, join, normalize } from 'path';

import { diary } from 'diary';

const { debug } = diary('gdu:roots');

export const GDU_ROOT = join(__dirname, '../../');

export const PROJECT_ROOT = join(process.cwd(), '/');

function findWorkspaceRoot(initial: string): string | null {
	let previous: string | null = null;
	let current = normalize(initial);
	do {
		const pkgPath = join(current, 'package.json');
		if (existsSync(pkgPath)) {
			try {
				const manifest = JSON.parse(readFileSync(pkgPath, 'utf8'));
				const workspaces = manifest.workspaces;
				if (
					Array.isArray(workspaces) ||
					(workspaces && Array.isArray(workspaces.packages))
				) {
					return current;
				}
			} catch {
				// Ignore malformed package.json
			}
		}
		previous = current;
		current = dirname(current);
	} while (current !== previous);
	return null;
}

const maybeWorkspaceRoot: string | null = findWorkspaceRoot(PROJECT_ROOT);

export const CALLING_WORKSPACE_ROOT: string | null = maybeWorkspaceRoot
	? join(maybeWorkspaceRoot, '/')
	: null;

debug('%O', {
	GDU_ROOT,
	PROJECT_ROOT,
	CALLING_WORKSPACE_ROOT,
});
