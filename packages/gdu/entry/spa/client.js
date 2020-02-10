import client_app from '__consumer_client__';

// TODO: Give this client function a config object

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
