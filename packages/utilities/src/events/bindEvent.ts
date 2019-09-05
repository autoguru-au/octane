export const bindEvent = <
	Node extends HTMLElement | HTMLDocument,
	K extends keyof HTMLElementEventMap
>(
	node: Node,
	event: K,
	callback: (event: HTMLElementEventMap[K]) => unknown,
) => {
	node.addEventListener(event, callback as EventListener);

	return () => {
		node.removeEventListener(event, callback as EventListener);
	};
};
