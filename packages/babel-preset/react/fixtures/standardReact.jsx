import React, { memo } from 'react';

class GreetSomeone extends React.Component {
	render() {
		return (
			<div>
				{this.props.greeting} {this.props.subject}!
			</div>
		);
	}
}

function App() {
	const [greeting, setGreeting] = React.useState('HELLO');

	function handleGreetingChange(event) {
		const input = event.target;
		const newGreeting = input.value.toUpperCase();
		setGreeting(newGreeting);
	}

	return (
		<form>
			<div>
				<label htmlFor="greeting">Greeting: </label>
				<input
					id="greeting"
					onChange={handleGreetingChange}
					value={greeting}
				/>
			</div>
			<div>
				<GreetSomeone greeting={greeting} subject="Nancy" />
			</div>
		</form>
	);
}

const MemoTest = memo(() => <h1>test</h1>);
