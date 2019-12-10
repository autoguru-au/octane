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

function test(firstArg, ...args) {
	const [,test2] = args;
	console.log(firstArg, args[0], test2);
}
`;

describe('web preset', () => {
	it('should match the snapshot', async () => {
		const { code } = await transformAsync(fixture, {
			babelrc: false,
			presets: [[require('.'), { debug: false }]],
		});

		return expect(code).toMatchSnapshot();
	});

	it('should allow for corejs override', async () => {
		const { code } = await transformAsync(fixture, {
			babelrc: false,
			presets: [[require('.'), { debug: false, corejs: 2 }]],
		});

		return expect(code).toMatchSnapshot();
	});

	it('should allow for cjs modules', async () => {
		const { code } = await transformAsync(fixture, {
			babelrc: false,
			presets: [[require('.'), { debug: false, modules: 'commonjs' }]],
		});

		return expect(code).toMatchSnapshot();
	});

	it('should do the __DEV__ dev expression', async () => {
		const { code } = await transformAsync(
			`
		if (__DEV__) {
			console.log('test');
		}
		`,
			{
				babelrc: false,
				presets: [[require('.'), { debug: false }]],
			},
		);

		return expect(code).toMatchSnapshot();
	});

	it('should do the invariant dev expression', async () => {
		const { code } = await transformAsync(
			`
		invariant(test === true, "some error");
		`,
			{
				babelrc: false,
				presets: [[require('.'), { debug: false }]],
			},
		);

		return expect(code).toMatchSnapshot();
	});

	it('should do the warning dev expression', async () => {
		const { code } = await transformAsync(
			`
		warning(test === true, "some error");
		`,
			{
				babelrc: false,
				presets: [[require('.'), { debug: false }]],
			},
		);

		return expect(code).toMatchSnapshot();
	});

	it('should optimize clsx', async () => {
		const { code } = await transformAsync(
			`
			import clsx from 'clsx';

			const validCondition = true;
			const invalidCondition = false;
			const a = 'a-class';
			const b = 'b-class';
			const d = 'd-class';

			clsx('a');
			clsx(a);
			clsx(['a', b]);
			clsx(a, 'b', ['c', d]);
			clsx(a, 'b', ['c', d], 'e');
			clsx(a, {
			        ['b']: true,
			        ['c']: false,
			        ['e']: someCondition,
			        f: true,
			        g: false,
			        h: someCondition,
			        i: validCondition,
			        j: invalidCondition
			});
			clsx(validCondition && 'a');
			clsx({
				btn: true,
				'btn-foo': isDisabled,
				'btn-bar': !isDisabled,
			});
		`,
			{
				babelrc: false,
				presets: [[require('.'), { debug: false }]],
			},
		);

		return expect(code).toMatchSnapshot();
	});
});
