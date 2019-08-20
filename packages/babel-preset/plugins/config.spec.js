const { transformFileAsync } = require('@babel/core');
const { join } = require('path');
const fixtures = join(__dirname, 'fixtures');

describe('config', () => {

	it('should match snapshot', async () => {

		const { code } = await transformFileAsync(join(fixtures, 'example.js'), {
			babelrc: false,
			plugins: [
				require('./config'),
			],
		});

		console.log(code);

		expect(code)
			.toMatchSnapshot();

	});
});
