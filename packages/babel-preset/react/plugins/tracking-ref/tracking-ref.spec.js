const { transformFileAsync } = require('@babel/core');
const { sync } = require('glob');
const { join, relative } = require('path');
const fixtures = join(__dirname, 'fixtures');

describe('react-preset/track ref plugin', () => {
	sync(join(fixtures, '/**/*.jsx')).forEach(file => {
		it(`should match the snapshot for fixture ${relative(
			__dirname,
			file,
		)}`, async () => {
			const { code } = await transformFileAsync(file, {
				babelrc: false,
				plugins: [
					[
						join(__dirname, './index.js'),
						{
							debug: true,
						},
					],
				],
			});

			expect(code).toMatchSnapshot();
		});
	});
});
