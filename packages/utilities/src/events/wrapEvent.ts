type Handler<EventType> = (event: EventType) => void;

export const wrapEvent = <E extends Partial<Event>>(
	callback: Handler<E>,
	handler?: Handler<E>,
) => (event: E) => {
	if (handler) {
		handler(event);
	}

	if (!event.defaultPrevented) {
		return callback(event);
	}
};
