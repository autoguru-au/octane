try {
	const { publicPathBase } = require('gdu/config');

	// eslint-disable-next-line valid-typeof, no-constant-binary-expression
	if (typeof publicPathBase !== undefined) {
		__webpack_require__.p = publicPathBase + __webpack_require__.p;
	}
	// eslint-disable-next-line sonarjs/no-ignored-exceptions, unicorn/prefer-optional-catch-binding, @typescript-eslint/no-unused-vars
} catch (error) {
	// We dont care.
}
