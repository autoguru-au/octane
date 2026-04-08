import { promises as fs } from 'fs';
import * as process from 'node:process';
import { join } from 'path';

import { cyan, magenta } from 'kleur';
import webpack, { Configuration } from 'webpack';

import buildConfigs from '../../config/webpack';
import { GuruConfig } from '../../lib/config';
import { copyExternalsToOutput } from '../../lib/externals-builder';
import { run } from '../../lib/runWebpack';
import { getHooks } from '../../utils/hooks';

const deleteLicenseFiles = async (dir: string): Promise<number> => {
	let deleteCount = 0;
	const files = await fs.readdir(dir);
	for (const file of files) {
		const filePath = join(dir, file);
		const stat = await fs.stat(filePath);
		if (stat.isDirectory()) {
			deleteCount += await deleteLicenseFiles(filePath);
		} else if (file.endsWith('.LICENSE.txt')) {
			await fs.unlink(filePath);
			console.log(`Deleted: ${filePath}`);
			deleteCount++;
		}
	}
	return deleteCount;
};
export const buildSPA = async (guruConfig: GuruConfig) => {
	const hooks = getHooks();

	const withBabelDebug = process.env.BABEL_DEBUG === 'true';
	console.log(
		`${cyan('Building SPA...')}${withBabelDebug ? magenta(' BABEL DEBUG MODE') : ''}`,
	);
	const webpackConfigs: Configuration[] = hooks.webpackConfig.call(
		buildConfigs({
			env: void 0,
			isDebug: false,
			standalone: guruConfig?.standalone,
		}),
	);

	// first clear build directory
	if (await fs.stat(guruConfig.outputPath).catch(() => false)) {
		await fs.rmdir(guruConfig.outputPath, { recursive: true });
	}
	await fs.mkdir(guruConfig.outputPath, { recursive: true });
	const compiler = webpack(webpackConfigs);
	await run(compiler);

	const deletedFilesCount = await deleteLicenseFiles(guruConfig.outputPath);
	console.log(cyan(`Deleted ${deletedFilesCount} license files`));

	// Build and copy self-hosted externals into the output directory
	// so they deploy alongside MFE assets on S3/CloudFront.
	if (!guruConfig?.standalone) {
		await copyExternalsToOutput(guruConfig.outputPath);
	}

	return {
		artifactPath: guruConfig.outputPath,
	};
};
