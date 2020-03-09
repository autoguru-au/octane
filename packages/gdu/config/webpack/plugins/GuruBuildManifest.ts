import { Compiler } from 'webpack';
import { META_SYMBOL } from './ConfigPlugin';

interface EnvironmentFiles {
	[envName: string]: {
		js: string[];
		css: string[];
	};
}

interface Manifest {
	hash: string;
	env: EnvironmentFiles;
}

export class GuruBuildManifest {
	public apply(compiler: Compiler) {
		const fileMap: Manifest = {
			hash: '',
			env: {},
		};

		compiler.hooks.emit.tapAsync(
			'BuildManifestPlugin',
			(compilation, cb) => {
				fileMap.hash = compilation.hash;

				const js = [];
				const css = [];

				for (const [
					,
					entrypoint,
				] of compilation.entrypoints.entries()) {
					for (const file of entrypoint.getFiles()) {
						if (file.endsWith('.js')) js.push(file);
						if (file.endsWith('.css')) css.push(file);
					}
				}

				for (const chunk of compilation.chunks) {
					if (typeof chunk[META_SYMBOL] !== 'undefined') {
						const { name, config } = chunk[META_SYMBOL];

						const prefixCreator = path =>
							`${config.publicPathBase ?? ''}${compiler.options
								.output.publicPath ?? ''}${path}`;

						fileMap.env[name] = {
							js: [...chunk.files, ...js].map(prefixCreator),
							css: [...css].map(prefixCreator),
						};
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
