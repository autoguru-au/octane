import { getExternals } from '../externals';

const EXPECTED_KEYS = [
	'react',
	'react-dom',
	'react-dom/client',
	'react/jsx-runtime',
	'react/jsx-dev-runtime',
	'@datadog/browser-rum',
	'@datadog/browser-rum-react',
	'@datadog/browser-logs',
];

const CDN_PREFIX = 'https://esm.autoguru.com/';

describe('getExternals', () => {
	it('emits the eight expected specifier keys', () => {
		const externals = getExternals();
		expect(Object.keys(externals).sort()).toEqual(
			[...EXPECTED_KEYS].sort(),
		);
	});

	it('routes every URL through the self-hosted esm CDN', () => {
		const externals = getExternals() as Record<string, string>;
		for (const [specifier, url] of Object.entries(externals)) {
			expect(url.startsWith(CDN_PREFIX)).toBe(true);
			// Defensive: no stray esm.sh URLs left over.
			expect(url).not.toContain('esm.sh');
			// Each URL must encode a versioned package.
			expect(url).toMatch(/@\d/);
			expect(specifier.length).toBeGreaterThan(0);
		}
	});

	it('aliases jsx-dev-runtime to the same URL as jsx-runtime', () => {
		const externals = getExternals() as Record<string, string>;
		expect(externals['react/jsx-dev-runtime']).toBe(
			externals['react/jsx-runtime'],
		);
	});

	it('returns an empty map for standalone MFEs', () => {
		expect(getExternals({ standalone: true })).toEqual({});
	});

	it('accepts the legacy zero-arg call shape', () => {
		// Callers that omit options altogether must still get the prod map —
		// this guards against an accidental destructure that requires an arg.
		expect(() => getExternals()).not.toThrow();
		expect(Object.keys(getExternals()).length).toBe(EXPECTED_KEYS.length);
	});
});
