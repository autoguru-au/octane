import { join } from 'path';

import { diary } from 'diary';
import getYarnWorkspaceRoot from 'find-yarn-workspace-root';
/* eslint-disable unicorn/prefer-module */
const { debug } = diary('gdu:roots');

export const GDU_ROOT = join(__dirname, '../../');

export const PROJECT_ROOT = join(process.cwd(), '/');

const maybeYarnWorkspacesRoot: null | string =
	getYarnWorkspaceRoot(PROJECT_ROOT);

export const CALLING_WORKSPACE_ROOT: string | null = maybeYarnWorkspacesRoot
	? join(maybeYarnWorkspacesRoot, '/')
	: null;

debug('%O', {
	GDU_ROOT,
	PROJECT_ROOT,
	CALLING_WORKSPACE_ROOT,
});
