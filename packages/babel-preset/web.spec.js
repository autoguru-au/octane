process.env.NODE_ENV = 'production';

const { transformAsync } = require('@babel/core');

const fixture = `
const myVar = new Map([]);
class TestClass {
	static staticProp = 'static prop';
	prop = 'prop';
	
	get getterProp() {
		return 'getter prop';
	}
}

const objectA = {a: 'a', b: 'b'};

const d = 'd';
const objectB = {...objectA, c: 'c', [d]: 'd'};
`;

describe('web preset', function() {
	it('should match the snapshot', async () => {
		const { code } = await transformAsync(fixture, {
			babelrc: false,
			presets: [[require('./web'), { debug: false }]],
		});

		return expect(code).toMatchSnapshot();
	});

	it('should allow for corejs override', async () => {
		const { code } = await transformAsync(fixture, {
			babelrc: false,
			presets: [[require('./web'), { debug: false, corejs: 3 }]],
		});

		return expect(code).toMatchSnapshot();
	});
});
