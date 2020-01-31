import { Compiler } from 'webpack';

export class GuruBuildManifest {
	public apply(compiler: Compiler) {
		const fileMap = {
			hash: '',
			publicPath: compiler.options.output.publicPath,
			assets: { css: [], js: [] },
		};

		compiler.hooks.emit.tapAsync(
			'BuildManifestPlugin',
			(compilation, cb) => {
				fileMap.hash = compilation.hash;

				for (const [
					,
					entrypoint,
				] of compilation.entrypoints.entries()) {
					for (const file of entrypoint.getFiles()) {
						if (file.endsWith('.js')) fileMap.assets.js.push(file);
						if (file.endsWith('.css'))
							fileMap.assets.css.push(file);
					}
				}

				compilation.assets['build-manifest.json'] = makeSource(
					JSON.stringify(fileMap, null, 4),
				);

				cb();
			},
		);
	}
}

function makeSource(contents) {
	return {
		source() {
			return Buffer.from(contents);
		},
		size() {
			return Buffer.byteLength(contents);
		},
	};
}
