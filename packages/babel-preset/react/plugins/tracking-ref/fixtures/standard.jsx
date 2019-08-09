function Button({ onClick, children }) {
	return <button onClick={onClick}>
		{children}
	</button>;
}

const Componet = () => {
	return (
		<>
			<div>
				<button onClick={void 0}>
					Example Button 1
				</button>

				<span>some text</span>

				<Test />

				<Button onClick={void 0}>
					<Icon icon={Account} />
					Login
				</Button>

				<a href={'test'} children={'Test'} />

				<Link render={<link href="test" />}>
					test
				</Link>
			</div>
		</>
	);
};

const Test = () => {
	return <a href="">Example anchor</a>;
};
