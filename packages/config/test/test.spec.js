const { join, resolve } = require('path');
const fixtures = join(__dirname, 'fixtures');
const { getConfigFor } = require('../lib/index');

describe('config', () => {

	describe('when lib', () => {
		it('should return the correct things', () => {
			getConfigFor('test', {
				cwd: fixtures,
			});
		});
	});
});
