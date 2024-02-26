
const isProduction: boolean = process.env.NODE_ENV === 'production';
const prefix: string = 'Invariant failed';

const invariant = (
	condition: any,
	message?: string,
): asserts condition => {
	if (condition) {
		return;
	}
	if (isProduction) {
		throw new Error(prefix);
	}
	throw new Error(`${prefix}: ${message || ''}`);
};

export default invariant;
