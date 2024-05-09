type Level = 'debug' | 'info' | 'error';

interface Payload<T> {
	type: string;
	level: Level;
	message: string | Error;
	payload: T;
}

export const createLogger = (realm: string) => {
	return {
		debug: createLogThing('debug', realm),
		info: createLogThing('info', realm),
		error: createLogThing('error', realm),
	};
};

const createLogThing =
	(level: Level, realm: string) =>
	(message: string | Error, extra?: object | string | number) => {
		if (level === 'debug' && process.env.NODE_ENV === 'production') return;

		printPayload({
			type: realm,
			level,
			message,
			payload: extra,
		});
	};

const printPayload = <T>(payload: Payload<T>) => {
	const decorated = {
		...payload,
		timestamp: new Date().toISOString(),
	};

	if (decorated.message instanceof Error) {
		const error = decorated?.message;
		decorated.message = error.message;

		// @ts-ignore
		if (!process.__browser__)
			decorated.payload = Object.assign({}, decorated.payload, {
				stackTrace: error?.stack,
			});
	}

	const logMethod = getConsoleMethod(payload);

	// @ts-ignore
	if (process.__browser__) {
		logMethod(`${decorated.type} :: ${decorated.message}`, decorated);
	} else {
		logMethod(JSON.stringify(decorated));
	}
};

export const getConsoleMethod = <T>(payload: Payload<T>) =>
	payload.level === 'error' ? console.error : console.log;
