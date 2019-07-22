process.env.NODE_ENV = 'production';

const { transformFileAsync } = require('@babel/core');
const { readdirSync } = require('fs');
const { join } = require('path');
const fixtures = join(__dirname, 'fixtures');

describe('react preset', () => {
	readdirSync(fixtures).forEach(file => {
		it(`should match the snapshot for fixture ${file}`, async () => {
			const { code } = await transformFileAsync(join(fixtures, file), {
				babelrc: false,
				plugins: [join(__dirname, './react/named-memo.js')],
				presets: [require('./react')],
			});

			expect(code).toMatchSnapshot();
		});
	});
});
