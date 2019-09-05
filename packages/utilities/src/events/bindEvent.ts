/* This is what the impl should be - but until TypeDefintions emit properly, we'll have to stick to any's.

@see https://github.com/microsoft/TypeScript/issues/33254

export const bindEvent = <
	Node extends HTMLElement | HTMLDocument,
	K extends keyof HTMLElementEventMap
>(
	node: Node,
	type: K,
	callback: (event: HTMLElementEventMap[K]) => unknown,
) => {
	node.addEventListener(type, callback as EventListener);

	return () => {
		node.removeEventListener(type, callback as EventListener);
	};
};
*/

export const bindEvent = <Node extends HTMLElement | HTMLDocument>(
	node: Node,
	type: string,
	callback: (event: any) => unknown,
) => {
	node.addEventListener(type, callback as EventListener);

	return () => {
		node.removeEventListener(type, callback as EventListener);
	};
};
