import { join } from 'path';

import { dim, green } from 'kleur';
import dedent from 'ts-dedent';

import { getGuruConfig } from './config';
import { GDU_ROOT } from './roots';
import { columnLoop } from './terminal';
/* eslint-disable unicorn/prefer-module */
export const banner = (verb: string, app_name?: string) => {
	const projectName =
		app_name ??
		require(join(getGuruConfig().__configPath, './package.json')).name;

	console.log(dedent`${dim(columnLoop('-'))}

		${verb} ${green(projectName)}
		${dim(`gdu: v${require(join(GDU_ROOT, './package.json')).version}`)}

		${dim(columnLoop('-'))}`);
};
