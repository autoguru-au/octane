import { mfeEnvTokens } from '../mfeEnvTokens';

type TransformFn = (code: string) => { code: string; map: null } | null;

function getTransform(plugin: ReturnType<typeof mfeEnvTokens>): TransformFn {
	const hook = plugin.transform;
	if (typeof hook === 'function') {
		return hook.bind(null) as unknown as TransformFn;
	}
	throw new Error('expected transform to be a function hook');
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

		it('does not bake an init block into any chunk (owned by multiEnvConfigEmitter)', () => {
			const plugin = mfeEnvTokens(envTokens);
			expect(plugin).not.toHaveProperty('renderChunk');
		});
	});
});
