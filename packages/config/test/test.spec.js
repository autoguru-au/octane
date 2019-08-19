import { getConfig } from '../lib';

const { transformFileAsync } = require('@babel/core');
const { join, resolve } = require('path');
const fixtures = join(__dirname, 'fixtures');
const { getConfigFor } = require('../lib/index');

describe('config', () => {

	describe('when babel-plugin', () => {
		it.skip('should match snapshot', async () => {
			const { code } = await transformFileAsync(join(fixtures, 'index.js'), {
				babelrc: false,
				plugins: [
					require('../lib/babel-plugin'),
				],
			});


			expect(code).toMatchSnapshot();

		});
	});

	describe('when lib', () => {
		it('should return the correct things', () => {
			getConfigFor('test', {
				cwd: fixtures
			});
		});
	});
});
