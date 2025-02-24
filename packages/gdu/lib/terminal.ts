import { bgGreen, bold } from 'kleur';

import { getProjectName } from './config';

export const columnLoop = (char) =>
	Array.from({ length: process.stdout.columns }).fill('').join(char);

export const projectInfo = (message, location?: string) => {
	console.log(
		`${bold(bgGreen(` ${getProjectName(location)} `))} ${message}`,
	);
};
