import { getUserAgentRegExp } from 'browserslist-useragent-regexp';
import { green } from 'kleur';

import { WRAP_BANNER } from '../lib/configure';
import { writeFileAsync } from '../lib/io';

export const buildSupportedBrowsers = async () => {
	console.log(`${green('Building supported browsers list')}`);

	const regExp = getUserAgentRegExp({
		allowHigherVersions: true,
	});
	await writeFileAsync(
		'browsers.ts',
		WRAP_BANNER(`export const AGSupportedBrowsers = ${regExp}`),
	);
};

export default async () => {
	await buildSupportedBrowsers();
};
