import { Button } from '@autoguru/overdrive';

const Componet = () => {
	return (
		<>
			<button onClick={() => {}} />
			<Button onClick={() => {}} />
			<a href="" />
		</>
	);
};

const AnotherComponent = ({ spread }) => {
	return (
		<>
			<button onClick={() => {}} />
			<Button onClick={() => {}} {...spread} />
			<a href="" />
		</>
	);
};
