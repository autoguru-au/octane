import { invariant } from '@autoguru/utilities';

interface Props {
	/**
	 * The mount point for the MFE
	 */
	mountDomId?: string | HTMLElement;
	/**
	 * The class name for the mount point
	 */
	mountDomClass?: string;
	/**
	 * The name of the MFE
	 */
	projectName: string;

}

export const getMfeMountPoint = ({
									 mountDomId,
									 mountDomClass,
									 projectName,
								 }: Props): HTMLElement | null => {
	invariant(mountDomId || mountDomClass, 'You must provide a mountDomId or mountDomClass');
	let point: HTMLElement | null = null;
	if (typeof mountDomId === 'string') {
		point = document.querySelector('#' + mountDomId);
	} else if (typeof mountDomClass === 'string') {
		const elements = Array.from(document.querySelectorAll('.' + mountDomClass));
		for (const element of elements) {
			if (element.childNodes.length === 0) {
				point = element as HTMLElement;
				break;
			}
		}
	} else {
		point = mountDomId;
	}
	if (point && typeof point === 'object') {
		point.dataset.mfeAppName = projectName;
		point.setAttribute('__MFE_APP_ROOT__', '');
	}
	return point;
};
