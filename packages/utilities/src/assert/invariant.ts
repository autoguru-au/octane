export const invariant = (
	condition: boolean,
	message: string,
	...args: any[]
): void => {
	if (condition === true) {
		if (typeof console !== 'undefined') {
			console.error(`[Error]: ${message}`, ...args);
		}

		throw new Error(message);
	}
};
