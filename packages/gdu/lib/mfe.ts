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
	if (typeof mountDOMId === 'string') {
		point = document.querySelector('#' + mountDOMId);
	} else if (typeof mountDOMClass === 'string') {
		const wrapElement = document.querySelector(`.${mountDOMClass}-wrap`);
		// @ts-ignore
		if (wrapElement && wrapElement.firstChild && wrapElement.firstChild.shadowRoot) {
			const elements = Array.from(// @ts-ignore
				wrapElement.firstChild.shadowRoot.querySelectorAll('.' + mountDOMClass),
			);
			for (const element of elements) {// @ts-ignore
				if (element.childNodes.length === 0) {
					point = element as HTMLElement;
					break;
				}
			}
		} else {
			const elements = Array.from(
				document.querySelectorAll('.' + mountDOMClass),
			);
			for (const element of elements) {
				if (element.childNodes.length === 0) {
					point = element as HTMLElement;
					break;
				}
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
