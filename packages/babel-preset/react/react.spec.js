const { transformFileAsync } = require('@babel/core');
const { readdirSync } = require('fs');
const { join } = require('path');
const fixtures = join(__dirname, 'fixtures');

describe('react preset', () => {
	readdirSync(fixtures).forEach(file => {
		describe('when production', () => {
			beforeEach(() => {
				process.env.NODE_ENV = 'production';
			});

			it(`should match the snapshot for fixture ${file}`, async () => {
				const { code } = await transformFileAsync(
					join(fixtures, file),
					{
						babelrc: false,
						presets: [[require('.'), { experimental: true }]],
					},
				);

				expect(code).toMatchSnapshot();
			});
		});

		describe('when development', () => {
			beforeEach(() => {
				process.env.NODE_ENV = 'development';
			});

			it(`should match the snapshot for fixture ${file}`, async () => {
				const { code } = await transformFileAsync(
					join(fixtures, file),
					{
						babelrc: false,
						presets: [[require('.'), { experimental: true }]],
					},
				);

				expect(code).toMatchSnapshot();
			});
		});
	});
});
