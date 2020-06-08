export const createLogger = (realm: string) => {
	return {
		info: createLogThing('info', realm),
		error: createLogThing('error', realm),
	};
};

const createLogThing = (level: string, realm: string) => (
	message: string,
	extra?: object | string | number,
) =>
	printPayload({
		type: realm,
		level,
		message,
		payload: extra,
	});

const printPayload = (payload) => {
	const decorated = {
		...payload,
		timestamp: new Date().toISOString(),
	};

	if (process.env.NODE_ENV === 'production') {
		console.log(JSON.stringify(decorated));
	} else {
		console.log(
			`${decorated.timestamp} (${decorated.level}) | ${
				decorated.type
			} | ${JSON.stringify({
				message: decorated.message,
				payload: decorated.payload,
			})}`,
		);
	}
};
