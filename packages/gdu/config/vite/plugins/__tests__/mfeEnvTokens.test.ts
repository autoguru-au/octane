import { mfeEnvTokens } from '../mfeEnvTokens';

type TransformFn = (code: string) => { code: string; map: null } | null;
type RenderChunkFn = (
	code: string,
	chunk: { fileName: string },
) => { code: string; map: null } | null;

function getTransform(plugin: ReturnType<typeof mfeEnvTokens>): TransformFn {
	const hook = plugin.transform;
	if (typeof hook === 'function') {
		return hook.bind(null) as unknown as TransformFn;
	}
	throw new Error('expected transform to be a function hook');
}

function getRenderChunk(
	plugin: ReturnType<typeof mfeEnvTokens>,
): RenderChunkFn {
	const hook = plugin.renderChunk;
	if (typeof hook === 'function') {
		return hook.bind(null) as unknown as RenderChunkFn;
	}
	throw new Error('expected renderChunk to be a function hook');
}

const envTokens = {
	IS_PRODUCTION: '"#{IS_PRODUCTION}"',
	BASE_URL: '"#{BASE_URL}"',
};

describe('mfeEnvTokens', () => {
	describe('when no tokens are provided', () => {
		it('returns a no-op plugin with only a name', () => {
			const plugin = mfeEnvTokens({});
			expect(plugin.name).toBe('gdu-mfe-env-tokens');
			expect(plugin).not.toHaveProperty('transform');
			expect(plugin).not.toHaveProperty('renderChunk');
		});
	});

	describe('when tokens are provided', () => {
		it('applies only at build time, before define', () => {
			const plugin = mfeEnvTokens(envTokens);
			expect(plugin.apply).toBe('build');
			expect(plugin.enforce).toBe('pre');
		});

		it('rewrites process.env reads to globalThis.__MFE_ENV__ lookups', () => {
			const transform = getTransform(mfeEnvTokens(envTokens));

			const result = transform('const a = process.env.BASE_URL;');

			expect(result).toEqual({
				code: 'const a = globalThis.__MFE_ENV__["BASE_URL"];',
				map: null,
			});
		});

		it('rewrites every occurrence of every tracked key', () => {
			const transform = getTransform(mfeEnvTokens(envTokens));

			const result = transform(
				'a(process.env.BASE_URL);b(process.env.IS_PRODUCTION);c(process.env.BASE_URL);',
			);

			expect(result).toEqual({
				code: 'a(globalThis.__MFE_ENV__["BASE_URL"]);b(globalThis.__MFE_ENV__["IS_PRODUCTION"]);c(globalThis.__MFE_ENV__["BASE_URL"]);',
				map: null,
			});
		});

		it('does not rewrite keys that are only a prefix of the source token', () => {
			const transform = getTransform(mfeEnvTokens(envTokens));

			const result = transform('const a = process.env.BASE_URLX;');

			expect(result).toBeNull();
		});

		it('leaves untracked process.env keys untouched', () => {
			const transform = getTransform(mfeEnvTokens(envTokens));

			const result = transform('const a = process.env.NOT_TRACKED;');

			expect(result).toBeNull();
		});

		it('returns null when the code has no process.env reads', () => {
			const transform = getTransform(mfeEnvTokens(envTokens));

			expect(transform('const a = 1;')).toBeNull();
		});
	});

	describe('when bakeInitBlock is true (single-env default)', () => {
		// The exact bytes the old host + 6 old pipelines expect at the head of
		// the mfe-configs chunk: a globalThis.__MFE_ENV__ assignment carrying the
		// app's #{TOKEN} placeholders for tokenReplacement.sh to substitute.
		const expectedInitBlock =
			'globalThis.__MFE_ENV__={"IS_PRODUCTION":"#{IS_PRODUCTION}","BASE_URL":"#{BASE_URL}"};';

		it('prepends the exact init block to the mfe-configs chunk', () => {
			const renderChunk = getRenderChunk(
				mfeEnvTokens(envTokens, { bakeInitBlock: true }),
			);

			const result = renderChunk('const config = 1;', {
				fileName: 'mfe-configs-1a2b3c4d.js',
			});

			expect(result).toEqual({
				code: `${expectedInitBlock}const config = 1;`,
				map: null,
			});
		});

		it('leaves the chunk head byte-equal to the old single-env contract', () => {
			const renderChunk = getRenderChunk(
				mfeEnvTokens(envTokens, { bakeInitBlock: true }),
			);

			const result = renderChunk('const config = 1;', {
				fileName: 'mfe-configs-1a2b3c4d.js',
			});

			expect(result?.code.startsWith(expectedInitBlock)).toBe(true);
		});

		it('does not bake into chunks other than mfe-configs', () => {
			const renderChunk = getRenderChunk(
				mfeEnvTokens(envTokens, { bakeInitBlock: true }),
			);

			expect(
				renderChunk('const x = 1;', {
					fileName: 'main-1a2b3c4d.js',
				}),
			).toBeNull();
		});

		it('does not bake into confusably named chunks under chunks/', () => {
			const renderChunk = getRenderChunk(
				mfeEnvTokens(envTokens, { bakeInitBlock: true }),
			);

			expect(
				renderChunk('const x = 1;', {
					fileName: 'chunks/mfe-configs-panel-1a2b3c4d.js',
				}),
			).toBeNull();
		});

		it('bakes by default when no options are passed (safe default)', () => {
			const plugin = mfeEnvTokens(envTokens);
			expect(plugin).toHaveProperty('renderChunk');
		});
	});

	describe('when bakeInitBlock is false (multi-env opt-in)', () => {
		it('does not bake an init block into any chunk (owned by multiEnvConfigEmitter)', () => {
			const plugin = mfeEnvTokens(envTokens, { bakeInitBlock: false });
			expect(plugin).not.toHaveProperty('renderChunk');
		});
	});
});
