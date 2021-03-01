import { RuntimeConfigsPlugin } from 'configs-webpack-plugin';
import { Compiler } from 'webpack';

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

		const configChunks = new Map<string, { chunk: any; config: any }>();

		compiler.hooks.make.tap('BuildManifestPlugin', (compilation) => {
			RuntimeConfigsPlugin.getHooks(compilation).configChunks.tap(
				'guru',
				(configs, chunks) => {
					configChunks.clear();

					for (const [idx, config] of configs.entries()) {
						configChunks.set(config.name, {
							config,
							chunk: chunks[idx],
						});
					}
				},
			);
		});

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

				for (const [
					name,
					{ chunk, config },
				] of configChunks.entries()) {
					const prefixCreator = (path) =>
						`${config.config?.publicPathBase ?? ''}${
							compiler.options.output.publicPath ?? ''
						}${path}`;

					fileMap.env[name] = {
						js: [
							...chunk.files.filter((i) => i.endsWith('.js')),
							...js,
						].map((i) => prefixCreator(i)),
						css: [...css].map((i) => prefixCreator(i)),
					};
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
