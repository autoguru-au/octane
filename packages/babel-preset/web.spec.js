process.env.NODE_ENV = 'production';

const { transformAsync } = require('@babel/core');

describe('web preset', function() {
	it('should match the snapshot', async () => {
		const { code } = await transformAsync(
			`const myVar = new Map([]);
			class TestClass {
				static staticProp = 'static prop';
				prop = 'prop';
				
				get getterProp() {
					return 'getter prop';
				}
			}
			
			const objectA = {a: 'a', b: 'b'};
			
			const d = 'd';
			const objectB = {...objectA, c: 'c', [d]: 'd'};`,
			{
				babelrc: false,
				presets: [[require('./web'), { debug: false }]],
			}
		);

		return expect(code).toMatchSnapshot();
	});
});
