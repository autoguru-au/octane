import { invariant } from '../assert';

type Handler<EventType> = (event: EventType) => void;

export const wrapEvent = <E extends Partial<Event>>(
	handler: Handler<E>,
	consumerHandler?: Handler<E>,
) => (event: E) => {
	invariant(
		typeof handler === 'function',
		'You must supply a handler method.',
	);

	handler(event);

	if (!event.defaultPrevented && typeof consumerHandler !== 'undefined') {
		invariant(
			typeof consumerHandler === 'function',
			'You supplied a consumer handler that was supposed to be a function.',
		);

		return consumerHandler(event);
	}
};
