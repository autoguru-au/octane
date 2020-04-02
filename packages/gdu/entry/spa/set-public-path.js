try {
	const publicPathBase = require('gdu/config').publicPathBase;

	if (typeof publicPathBase !== undefined) {
		__webpack_require__.p = publicPathBase + __webpack_require__.p;
	}
} catch (e) {
	// We dont care.
}
