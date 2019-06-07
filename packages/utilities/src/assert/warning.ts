export const warning = (
	condition: boolean,
	message: string,
	...args: any[]
): void => {
	if (process.env.NODE_ENV !== 'production') {
		if (condition === true) {
			if (message === void 0) {
				throw new Error(
					`warning(condition: boolean, message: string, ...args: any[]) requires a message`,
				);
			}

			if (typeof console !== 'undefined') {
				console.warn(`[Warning]: ${message}`, ...args);
			}

			try {
				throw new Error(message);
			} catch (_) {}
		}
	}
};
