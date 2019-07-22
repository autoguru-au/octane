process.env.NODE_ENV = 'production';

const { transformAsync } = require('@babel/core');

describe('react preset', () => {
	it('should match the snapshot', async () => {
		const { code } = await transformAsync(
			`const FunctionComponent = () => (<h1>test</h1>);
			class ClassComponent extends React.Component {
				
				render() {
					return (<h1>test</h1>);
				}
			}
			
			const TestInline = () => (<div><FunctionComponent/><ClassComponent/></div>);`,
			{
				babelrc: false,
				presets: [require('./react')],
			},
		);

		expect(code).toMatchSnapshot();
	});
});
