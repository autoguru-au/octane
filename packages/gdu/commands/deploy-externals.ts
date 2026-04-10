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

	// Step 1: Build externals if not cached
	const cacheDir = await buildExternalsIfNeeded();
	const defs = getExternalDefs();

	// Step 2: Collect files to upload (.mjs + .mjs.map)
	const files: FileToUpload[] = [];
	for (const def of defs) {
		files.push({
			localPath: join(cacheDir, def.outFile),
			s3Key: `${prefix}/${def.outFile}`,
			contentType: 'application/javascript',
		});

		// Include sourcemap if it exists
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

	// Step 3: Lazily load AWS SDK (not loaded at CLI startup)
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { S3Client, PutObjectCommand, HeadObjectCommand } =
		require('@aws-sdk/client-s3');

	const client = new S3Client({ region });

	// Step 4: Upload with idempotency check
	let uploaded = 0;
	let skipped = 0;
	const failures: { key: string; error: Error }[] = [];

	const CACHE_CONTROL = 'public, max-age=31536000, immutable';

	for (const file of files) {
		const body = readFileSync(file.localPath);
		const localMd5 = createHash('md5').update(body).digest('hex');
		const localETag = `"${localMd5}"`;

		// Check if already exists with same content
		try {
			const head = await client.send(
				new HeadObjectCommand({ Bucket: bucket, Key: file.s3Key }),
			);
			if (head.ETag === localETag) {
				console.log(dim(`  skip  ${file.s3Key} (unchanged)`));
				skipped++;
				continue;
			}
		} catch (err: any) {
			// 404 = file doesn't exist yet, proceed to upload
			if (
				err.name !== 'NotFound' &&
				err.$metadata?.httpStatusCode !== 404
			) {
				throw err;
			}
		}

		// Upload
		try {
			await client.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: file.s3Key,
					Body: body,
					ContentType: file.contentType,
					CacheControl: CACHE_CONTROL,
				}),
			);
			console.log(green(`  put   ${file.s3Key}`));
			uploaded++;
		} catch (err: any) {
			console.error(red(`  FAIL  ${file.s3Key}: ${err.message}`));
			failures.push({ key: file.s3Key, error: err });
		}
	}

	// Summary
	console.log('');
	console.log(cyan('Summary:'));
	console.log(`  Uploaded: ${uploaded}`);
	console.log(`  Skipped:  ${skipped} (already up to date)`);
	if (failures.length > 0) {
		console.log(red(`  Failed:   ${failures.length}`));
		throw new Error(
			`Failed to upload ${failures.length} file(s): ${failures.map((f) => f.key).join(', ')}`,
		);
	}

	console.log(green('\nExternals deployed successfully'));
};
