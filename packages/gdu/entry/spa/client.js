// eslint-disable-next-line import/no-unresolved
import client_app from '__GDU_CONSUMER_CLIENT__';

const canPerformance =
	typeof performance !== 'undefined' &&
	typeof performance.mark === 'function' &&
	typeof performance.measure === 'function';

// -- BOOTSTRAP APP

if (canPerformance) performance.mark('beforeClientApp');

client_app();

if (canPerformance) performance.mark('afterClientApp');

// -- END BOOTSTRAP APP

completePerformanceMarks();

function completePerformanceMarks() {
	if (!canPerformance) return;

	performance.measure(
		`app-${__GDU_APP_NAME__}-initialize`,
		'beforeClientApp',
		'afterClientApp',
	);

	['beforeClientApp', 'afterClientApp'].forEach((mark) =>
		performance.clearMarks(mark),
	);
}

if (!__DEV__) {
	try {
		// eslint-disable-next-line sonarjs/no-nested-assignment
		(window.__AG_APPS = []).push({
			app: __GDU_APP_NAME__,
			build_info: __GDU_BUILD_INFO__,
			mode: process.env.NODE_ENV,
		});
		// eslint-disable-next-line unicorn/prefer-optional-catch-binding, sonarjs/no-ignored-exceptions, @typescript-eslint/no-unused-vars
	} catch (error) {
		// ignore
	}
}
