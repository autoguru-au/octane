export const getMfeMountPoint = (
	mountDomId: string,
	projectName: string,
): HTMLElement => {
	const point:HTMLElement = typeof mountDomId === 'string' ? document.querySelector('#' + mountDomId) : mountDomId;
	if(point && typeof point === 'object'){
		point.dataset.mfeAppName = projectName;
		point.setAttribute('__MFE_APP_ROOT__', '');
	}
	return point as HTMLElement;
};
