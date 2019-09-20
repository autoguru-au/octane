const { transformAsync } = require('@babel/core');


describe('plugins/clsx', () => {
	it(`should match snapshot`, async () => {

		const { code } = await transformAsync(`
		import clsx from 'clsx';
		
		const validCondition = true;
		const invalidCondition = false;
		
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
		`, {
			babelrc: false,
			plugins: [
				require.resolve('./index'),
			],
		});

		expect(code).toMatchSnapshot();

	});
});
