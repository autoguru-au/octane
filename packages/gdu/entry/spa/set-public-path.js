/* eslint-disable */

try {
	const { publicPathBase } = require('gdu/config');

	if (typeof publicPathBase !== undefined) {
		__webpack_require__.p = publicPathBase + __webpack_require__.p;
	}
} catch (error) {
	// We dont care.
}
