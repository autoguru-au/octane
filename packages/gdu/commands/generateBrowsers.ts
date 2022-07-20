import { getUserAgentRegExp } from 'browserslist-useragent-regexp';
import { writeFileAsync } from '../lib/io';
import { WRAP_BANNER } from '../lib/configure';
import { green } from 'kleur';

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
