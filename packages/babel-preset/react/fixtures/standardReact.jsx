import React, { memo } from 'react';
const FunctionComponent = () => <h1>test</h1>;

class ClassComponent extends React.Component {
	render() {
		return <h1>test</h1>;
	}
}

const TestInline = () => (
	<div>
		<FunctionComponent />
		<ClassComponent />
	</div>
);
const MemoTest = memo(() => <h1>test</h1>);
