import client_app from '__consumer_client__';

// -- BOOTSTRAP APP

client_app();

// -- END BOOTSTRAP APP

if (!__DEV__) {
	try {
		window.__VERSION = __BUILD_INFO__;
	} catch (error) {
		// ignore
	}
}
