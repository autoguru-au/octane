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

const APP = '@autoguru/sp-pricing';
const envTokens = {
	IS_PRODUCTION: '"#{IS_PRODUCTION}"',
	BASE_URL: '"#{BASE_URL}"',
};

type MfeEnv = Record<string, Record<string, unknown>>;

// The namespaced seed shape both plugins emit:
// globalThis.__MFE_ENV__=globalThis.__MFE_ENV__||{};globalThis.__MFE_ENV__[<ns>]=Object.assign(globalThis.__MFE_ENV__[<ns>]||{},<json>);
const SEED_RE =
	/^globalThis\.__MFE_ENV__=globalThis\.__MFE_ENV__\|\|\{\};globalThis\.__MFE_ENV__\[("(?:[^"\\]|\\.)*")\]=Object\.assign\(globalThis\.__MFE_ENV__\[\1\]\|\|\{\},(\{.*\})\);$/;
// A namespaced read: globalThis.__MFE_ENV__[<ns>][<key>]
const READ_RE =
	/^globalThis\.__MFE_ENV__\[("(?:[^"\\]|\\.)*")\]\[("(?:[^"\\]|\\.)*")\]$/;

// Applies a seed's runtime effect by parsing its known shape rather than
// eval-ing it — and asserts the seed really is in the namespaced merge form.
function applySeed(env: MfeEnv, source: string): MfeEnv {
	const match = SEED_RE.exec(source);
	if (!match) throw new Error(`seed not in namespaced merge form: ${source}`);
	const ns = JSON.parse(match[1]) as string;
	const values = JSON.parse(match[2]) as Record<string, unknown>;
	return { ...env, [ns]: { ...env[ns], ...values } };
}

// Resolves a rewritten read against a seeded env, proving the read and the
// write agree on the app-name key.
function readValue(env: MfeEnv, readExpr: string): unknown {
	const match = READ_RE.exec(readExpr);
	if (!match) throw new Error(`read is not namespaced: ${readExpr}`);
	const ns = JSON.parse(match[1]) as string;
	const key = JSON.parse(match[2]) as string;
	return env[ns]?.[key];
}

function seedFor(app: string, mfeBasePath: string): string {
	const block = getRenderChunk(
		mfeEnvTokens({ mfeBasePath: JSON.stringify(mfeBasePath) }, app, {
			bakeInitBlock: true,
		}),
	)('', { fileName: 'mfe-configs-1a2b3c4d.js' });
	if (!block) throw new Error('expected an init block');
	return block.code;
}

function readFor(app: string): string {
	const rewritten = getTransform(
		mfeEnvTokens({ mfeBasePath: '"#{X}"' }, app),
	)('process.env.mfeBasePath');
	if (!rewritten) throw new Error('expected a rewritten read');
	return rewritten.code;
}

function loadSeeds(seedsInLoadOrder: string[]): MfeEnv {
	return seedsInLoadOrder.reduce(
		(env, seed) => applySeed(env, seed),
		{} as MfeEnv,
	);
}

describe('mfeEnvTokens', () => {
	describe('when no tokens are provided', () => {
		it('returns a no-op plugin with only a name', () => {
			const plugin = mfeEnvTokens({}, APP);
			expect(plugin.name).toBe('gdu-mfe-env-tokens');
			expect(plugin).not.toHaveProperty('transform');
			expect(plugin).not.toHaveProperty('renderChunk');
		});
	});

	describe('when tokens are provided', () => {
		it('applies only at build time, before define', () => {
			const plugin = mfeEnvTokens(envTokens, APP);
			expect(plugin.apply).toBe('build');
			expect(plugin.enforce).toBe('pre');
		});

		it('rewrites process.env reads to the app-namespaced __MFE_ENV__ lookups', () => {
			const transform = getTransform(mfeEnvTokens(envTokens, APP));

			const result = transform('const a = process.env.BASE_URL;');

			expect(result).toEqual({
				code: 'const a = globalThis.__MFE_ENV__["@autoguru/sp-pricing"]["BASE_URL"];',
				map: null,
			});
		});

		it('rewrites every occurrence of every tracked key', () => {
			const transform = getTransform(mfeEnvTokens(envTokens, APP));

			const result = transform(
				'a(process.env.BASE_URL);b(process.env.IS_PRODUCTION);c(process.env.BASE_URL);',
			);

			expect(result).toEqual({
				code: 'a(globalThis.__MFE_ENV__["@autoguru/sp-pricing"]["BASE_URL"]);b(globalThis.__MFE_ENV__["@autoguru/sp-pricing"]["IS_PRODUCTION"]);c(globalThis.__MFE_ENV__["@autoguru/sp-pricing"]["BASE_URL"]);',
				map: null,
			});
		});

		it('namespaces reads under the building app, so two apps read different keys', () => {
			const shellRead = getTransform(
				mfeEnvTokens(envTokens, '@autoguru/sp-app-shell'),
			)('process.env.BASE_URL');
			const pricingRead = getTransform(
				mfeEnvTokens(envTokens, '@autoguru/sp-pricing'),
			)('process.env.BASE_URL');

			expect(shellRead?.code).toBe(
				'globalThis.__MFE_ENV__["@autoguru/sp-app-shell"]["BASE_URL"]',
			);
			expect(pricingRead?.code).toBe(
				'globalThis.__MFE_ENV__["@autoguru/sp-pricing"]["BASE_URL"]',
			);
		});

		it('does not rewrite keys that are only a prefix of the source token', () => {
			const transform = getTransform(mfeEnvTokens(envTokens, APP));

			const result = transform('const a = process.env.BASE_URLX;');

			expect(result).toBeNull();
		});

		it('leaves untracked process.env keys untouched', () => {
			const transform = getTransform(mfeEnvTokens(envTokens, APP));

			const result = transform('const a = process.env.NOT_TRACKED;');

			expect(result).toBeNull();
		});

		it('returns null when the code has no process.env reads', () => {
			const transform = getTransform(mfeEnvTokens(envTokens, APP));

			expect(transform('const a = 1;')).toBeNull();
		});
	});

	describe('when bakeInitBlock is true (single-env default)', () => {
		// The single-env contract: a namespaced, non-destructive
		// globalThis.__MFE_ENV__["<app>"] seed carrying the app's #{TOKEN}
		// placeholders for tokenReplacement.sh to substitute. The leading
		// `||{}` guard keeps a co-mounted app's namespace intact.
		const expectedInitBlock =
			'globalThis.__MFE_ENV__=globalThis.__MFE_ENV__||{};' +
			'globalThis.__MFE_ENV__["@autoguru/sp-pricing"]=Object.assign(globalThis.__MFE_ENV__["@autoguru/sp-pricing"]||{},{"IS_PRODUCTION":"#{IS_PRODUCTION}","BASE_URL":"#{BASE_URL}"});';

		it('prepends the exact init block to the mfe-configs chunk', () => {
			const renderChunk = getRenderChunk(
				mfeEnvTokens(envTokens, APP, { bakeInitBlock: true }),
			);

			const result = renderChunk('const config = 1;', {
				fileName: 'mfe-configs-1a2b3c4d.js',
			});

			expect(result).toEqual({
				code: `${expectedInitBlock}const config = 1;`,
				map: null,
			});
		});

		it('preserves the #{TOKEN}+sed contract (globalThis.__MFE_ENV__= assignment present)', () => {
			const renderChunk = getRenderChunk(
				mfeEnvTokens(envTokens, APP, { bakeInitBlock: true }),
			);

			const result = renderChunk('const config = 1;', {
				fileName: 'mfe-configs-1a2b3c4d.js',
			});

			expect(result?.code).toContain('globalThis.__MFE_ENV__=');
			expect(result?.code).toContain('"#{IS_PRODUCTION}"');
			expect(result?.code.startsWith(expectedInitBlock)).toBe(true);
		});

		it('does not bake into chunks other than mfe-configs', () => {
			const renderChunk = getRenderChunk(
				mfeEnvTokens(envTokens, APP, { bakeInitBlock: true }),
			);

			expect(
				renderChunk('const x = 1;', {
					fileName: 'main-1a2b3c4d.js',
				}),
			).toBeNull();
		});

		it('does not bake into confusably named chunks under chunks/', () => {
			const renderChunk = getRenderChunk(
				mfeEnvTokens(envTokens, APP, { bakeInitBlock: true }),
			);

			expect(
				renderChunk('const x = 1;', {
					fileName: 'chunks/mfe-configs-panel-1a2b3c4d.js',
				}),
			).toBeNull();
		});

		it('bakes by default when no options are passed (safe default)', () => {
			const plugin = mfeEnvTokens(envTokens, APP);
			expect(plugin).toHaveProperty('renderChunk');
		});
	});

	describe('when bakeInitBlock is false (multi-env opt-in)', () => {
		it('does not bake an init block into any chunk (owned by multiEnvConfigEmitter)', () => {
			const plugin = mfeEnvTokens(envTokens, APP, {
				bakeInitBlock: false,
			});
			expect(plugin).not.toHaveProperty('renderChunk');
		});
	});

	// Reproduces the AG-20532 deep-link failure: two co-mounted apps both read
	// `mfeBasePath`, the shell an absolute URL, the child a relative router
	// basename. On the flat layout the last config script to load won for BOTH
	// readers, so the shell built relative hrefs and nav compounded. Namespacing
	// makes each bundle read only its own value, whatever the script order.
	describe('co-mounted apps (no clobber, order-independent)', () => {
		const SHELL = '@autoguru/sp-app-shell';
		const CHILD = '@autoguru/sp-pricing';
		const shellBase = 'https://supplier.preprod.autoguru.com/nz';
		const childBase = 'nz/pricing';

		it('the shell reads its own absolute base even when the child config loads after it', () => {
			const env = loadSeeds([
				seedFor(SHELL, shellBase),
				seedFor(CHILD, childBase),
			]);

			expect(readValue(env, readFor(SHELL))).toBe(shellBase);
		});

		it('is order-independent: reversing the config load order changes nothing', () => {
			const env = loadSeeds([
				seedFor(CHILD, childBase),
				seedFor(SHELL, shellBase),
			]);

			expect(readValue(env, readFor(SHELL))).toBe(shellBase);
			expect(readValue(env, readFor(CHILD))).toBe(childBase);
		});
	});
});
