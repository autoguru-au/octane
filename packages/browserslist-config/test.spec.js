const browserslist = require('browserslist');

const config = require('.');

describe('config', () => {
	// `last 1 year` is measured from Date.now(), so on a live clock this snapshot goes
	// stale by itself as the calendar moves. Pin the clock to the day the snapshot was
	// last refreshed (#440) and refresh both together when caniuse-lite is bumped.
	// Pinned for the whole suite because browserslist caches resolved queries, so the
	// first call fixes the result for every later one.
	let now;
	beforeAll(() => {
		now = jest
			.spyOn(Date, 'now')
			.mockReturnValue(Date.parse('2026-07-09T00:00:00Z'));
	});
	afterAll(() => {
		now.mockRestore();
	});

	it('should resolve a list of browsers', () => {
		expect(browserslist(config).length).toBeGreaterThan(1);
	});

	it('should match snapshot', () => {
		expect(browserslist(config)).toMatchSnapshot();
	});
});
