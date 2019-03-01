export const warning = (
	condition: boolean,
	message: string,
	...args: Array<any>
): void => {
	if (
		process.env.NODE_ENV === 'development' ||
		process.env.NODE_ENV === 'test'
	) {
		if (condition === true) {
			if (message === void 0) {
				throw new Error(
					`warning(condition: boolean, message: string, ...args: any[]) requires a message`
				);
			}

			if (typeof console !== 'undefined') {
				console.warn(`[Warning]: ${message}`, ...args);
			}

			try {
				throw new Error(message);
			} catch (x) {
				// @ts-ignore - we throw an error, so our React friends have a stack trace to follow for the errors
			}
		}
	}
};
