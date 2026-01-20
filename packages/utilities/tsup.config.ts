import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		'logger/index': 'src/logger/index.ts',
		'assert/index': 'src/assert/index.ts',
		'number/index': 'src/number/index.ts',
		'events/index': 'src/events/index.ts',
	},
	format: ['cjs', 'esm'],
	dts: true,
	clean: true,
	sourcemap: true,
	splitting: false,
	treeshake: true,
	outDir: 'dist',
	outExtension({ format }) {
		return {
			js: format === 'cjs' ? '.cjs' : '.js',
		};
	},
});
