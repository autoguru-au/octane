/**
 * Will be set to true when a local development environment is currently running.
 */
declare const __DEV__: boolean;

/**
 * Houses the name of the built app (package.json's name property)
 */
declare const __GDU_APP_NAME__: string;

/**
 * Tells you some build information for the current app scope.
 */
declare const __GDU_BUILD_INFO__: Readonly<{ commit: string; branch: string }>;

// Sets up some node environment things which are used by webpack at build-time.
declare namespace NodeJS {
	interface Process {
		/**
		 * Will be set to true when building for a browser
		 */
		readonly browser: boolean;
	}

	interface ProcessEnv {
		readonly NODE_ENV: 'development' | 'production';
	}
}

// We need to declare this so imports resolve with typescript. This module is virtual.
declare module 'gdu/config';
