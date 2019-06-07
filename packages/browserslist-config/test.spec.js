const browserslist = require('browserslist');
const config = require('.');

describe('config', () => {
	it('should resolve a list of browsers', () => {
		expect(browserslist(config).length).toBeGreaterThan(1);
	});

	it('should match snapshot', () => {
		expect(browserslist(config)).toMatchSnapshot();
	});
});
