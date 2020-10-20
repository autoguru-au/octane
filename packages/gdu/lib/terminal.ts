import { bgMagenta, bold } from 'kleur';

import { getProjectName } from './config';

export const columnLoop = (char) =>
	new Array(process.stdout.columns).fill('').join(char);

export const projectInfo = (message, location) => {
	console.log(
		`${bold(bgMagenta(` ${getProjectName(location)} `))} ${message}`,
	);
};
