import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { cyan, dim, green, red, yellow } from 'kleur';

import {
	buildExternalsIfNeeded,
	getExternalDefs,
} from '../lib/externals-builder';

interface DeployExternalsOptions {
	bucket: string;
	region: string;
	prefix: string;
	'dry-run': boolean;
}

interface FileToUpload {
	localPath: string;
	s3Key: string;
	contentType: string;
}

async function isUnchangedOnS3(
	client: any,
	HeadObjectCommand: any,
	bucket: string,
	key: string,
	localETag: string,
): Promise<boolean> {
	try {
		const head = await client.send(
			new HeadObjectCommand({ Bucket: bucket, Key: key }),
		);
		return head.ETag === localETag;
	} catch (error: any) {
		if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
			return false;
		}
		throw error;
	}
}

async function uploadFiles(
	files: FileToUpload[],
	bucket: string,
	region: string,
): Promise<{ uploaded: number; skipped: number; failures: string[] }> {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const {
		S3Client,
		PutObjectCommand,
		HeadObjectCommand,
	} = require('@aws-sdk/client-s3');

	const client = new S3Client({ region });
	let uploaded = 0;
	let skipped = 0;
	const failures: string[] = [];

	for (const file of files) {
		const body = readFileSync(file.localPath);
		// S3 ETags for single-part uploads are MD5 — must match their algorithm.
		// eslint-disable-next-line sonarjs/hashing
		const md5 = createHash('md5').update(body).digest('hex');
		const localETag = `"${md5}"`;

		if (
			await isUnchangedOnS3(
				client,
				HeadObjectCommand,
				bucket,
				file.s3Key,
				localETag,
			)
		) {
			console.log(dim(`  skip  ${file.s3Key} (unchanged)`));
			skipped++;
			continue;
		}

		try {
			await client.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: file.s3Key,
					Body: body,
					ContentType: file.contentType,
					CacheControl: 'public, max-age=31536000, immutable',
				}),
			);
			console.log(green(`  put   ${file.s3Key}`));
			uploaded++;
		} catch (error: any) {
			console.error(red(`  FAIL  ${file.s3Key}: ${error.message}`));
			failures.push(file.s3Key);
		}
	}

	return { uploaded, skipped, failures };
}

export default async (options: DeployExternalsOptions) => {
	const bucket = options.bucket;
	if (!bucket) {
		throw new Error(
			'The --bucket option is required. Usage: gdu deploy-externals --bucket <bucket-name>',
		);
	}

	const region = options.region || 'ap-southeast-2';
	const prefix = options.prefix || '_shared/externals';
	const dryRun = options['dry-run'] === true;

	console.log(cyan('Deploy externals to S3'));
	console.log(dim(`  Bucket: ${bucket}`));
	console.log(dim(`  Region: ${region}`));
	console.log(dim(`  Prefix: ${prefix}`));
	if (dryRun) console.log(yellow('  DRY RUN — no files will be uploaded'));

	const cacheDir = await buildExternalsIfNeeded();
	const defs = getExternalDefs();
	const files: FileToUpload[] = [];

	for (const def of defs) {
		files.push({
			localPath: join(cacheDir, def.outFile),
			s3Key: `${prefix}/${def.outFile}`,
			contentType: 'application/javascript',
		});

		const mapFile = `${def.outFile}.map`;
		const mapPath = join(cacheDir, mapFile);
		if (existsSync(mapPath)) {
			files.push({
				localPath: mapPath,
				s3Key: `${prefix}/${mapFile}`,
				contentType: 'application/json',
			});
		}
	}

	if (dryRun) {
		console.log(cyan(`\nWould upload ${files.length} files:`));
		for (const f of files) {
			console.log(`  s3://${bucket}/${f.s3Key}`);
		}
		return;
	}

	const { uploaded, skipped, failures } = await uploadFiles(
		files,
		bucket,
		region,
	);

	console.log('');
	console.log(cyan('Summary:'));
	console.log(`  Uploaded: ${uploaded}`);
	console.log(`  Skipped:  ${skipped} (already up to date)`);
	if (failures.length > 0) {
		console.log(red(`  Failed:   ${failures.length}`));
		throw new Error(
			`Failed to upload ${failures.length} file(s): ${failures.join(', ')}`,
		);
	}

	console.log(green('\nExternals deployed successfully'));
};
