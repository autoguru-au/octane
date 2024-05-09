import { invariant } from '@autoguru/utilities';

interface Props {
	/**
	 * The mount point for the MFE
	 */
	mountDOMId?: string | HTMLElement;
	/**
	 * The class name for the mount point
	 */
	mountDOMClass?: string;
	/**
	 * The name of the MFE
	 */
	projectName: string;
}

const queryShadowRoot = (wrapElement: Array<Element>, selector: string) => {
	//Find element with no shadow root
	if (wrapElement && wrapElement.length > 0) {
		for (const element of wrapElement) {
			if (
				// @ts-ignore
				!element.firstChild?.shadowRoot?.firstChild?.childNodes?.length
			) {
				// @ts-ignore
				return element.firstChild.shadowRoot.querySelector(selector);
			}
		}
	} else {
		return null;
	}
};
export const getMfeMountPoint = ({
	mountDOMId,
	mountDOMClass,
	projectName,
}: Props): HTMLElement | null => {
	invariant(
		mountDOMId || mountDOMClass,
		'You must provide a mountDOMId or mountDOMClass',
	);

	let point: HTMLElement | null = null;
	const wrapElements = Array.from(
		document.querySelectorAll(`.${mountDOMId || mountDOMClass}-wrap`),
	);
	if (typeof mountDOMId === 'string') {
		point =
			queryShadowRoot(wrapElements, '#' + mountDOMId) ||
			document.querySelector('#' + mountDOMId);
	} else if (typeof mountDOMClass === 'string') {
		const elements =
			[queryShadowRoot(wrapElements, '.' + mountDOMClass)] ||
			Array.from(document.querySelectorAll('.' + mountDOMClass));
		for (const element of elements) {
			if (element && !element?.childNodes?.length) {
				point = element as HTMLElement;
				break;
			}
		}
	} else {
		point = mountDOMId;
	}
	if (point && typeof point === 'object') {
		point.dataset.mfeAppName = projectName;
		point.setAttribute('__MFE_APP_ROOT__', '');
	}
	return point;
};
