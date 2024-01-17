import fs from 'fs';
import { join, resolve } from 'path';

import { Compiler } from 'webpack';

interface Asset {
	js: string[];
	css: string[];
}

interface Manifest {
	hash: string;
	mountDOMId: string;
	assets: Asset;
	chunks: Asset;
}

const emptyResults: Manifest = {
	hash: '',
	mountDOMId: '',
	assets: {
		js: [],
		css: [],
	},
	chunks: {
		js: [],
		css: [],
	},
};

const pluginName = 'GuruBuildManifestPlugin';
const defaultOptions = {
	// ignore files emitted by HMR by default
	excludeFile: /\.hot-update\.js$/,
	// group chunks by extension
	chunkGroupName: (filename) =>
		/\.([\da-z]+(\.map)?)(\?.*)?$/.exec(filename)[1],
	outputDir: process.cwd(),
	filename: 'build-manifest.json',
	// generate contents to save to manifest file
	objectToString: (result) => JSON.stringify(result),
	includeChunks: true,
	publicPath: '',
	mountDOMId: '',
};

export class GuruBuildManifest {
	private options: Partial<typeof defaultOptions> = {};
	private result: Manifest = emptyResults;

	constructor(options: Partial<typeof defaultOptions>) {
		// overwrite default options
		this.options = Object.assign({}, defaultOptions, options);
		this.result = {
			...emptyResults,
		};
	}

	public apply(compiler: Compiler) {
		compiler.hooks.emit.tap(pluginName, (compilation) => {
			this.result = { ...emptyResults };
			this.result.hash = compilation.hash;
			this.result.mountDOMId = this.options.mountDOMId;
			compilation.chunks.forEach((chunk) => {
				chunk.files.forEach((filename) => {
					if (
						this._excludeChunk(
							this.options.excludeFile,
							filename,
							chunk,
						) === true
					) {
						return;
					}
					// @ts-ignore
					const ext = this.options.chunkGroupName(filename, chunk);
					if (chunk.name)
						// Is not a lazy chunk
						this.result.assets[ext].push(
							`${this.options.publicPath}${filename}`,
						);
					else if (this.options.includeChunks)
						this.result.chunks[ext].push(
							`${this.options.publicPath}${filename}`,
						);
				});
			});
			if (!this.options.includeChunks) this.result.chunks = void 0;
			this.saveJson();
		});
	}

	saveJson() {
		// try to create outputDir folder if it is within project root
		if (this._shouldFolderBeCreated(this.options.outputDir) === true) {
			let pathStep = process.cwd();
			// remove relative prefix
			const normalizedOutputPath = this._normalizeOutputDir(
				this.options.outputDir,
			);
			normalizedOutputPath.split('/').forEach((folder) => {
				pathStep = join(pathStep, folder);
				try {
					fs.mkdirSync(pathStep);
				} catch {
					// we don't care if it already exists, just continue...
				}
			});
		}
		const file = resolve(this.options.outputDir, this.options.filename);
		const blob = this.options.objectToString(this.result);
		try {
			fs.writeFileSync(file, blob, { flag: 'w' });
			console.log(`File successfully created - ${file}`);
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * We might want to skip some entries
	 * this function checks users criteria and returns a bool
	 * @param Function|RegEx excludeCriterium - passed option to skip some entries
	 */
	_excludeChunk(excludeCriterium, filename, chunk) {
		if (typeof excludeCriterium === 'function') {
			return excludeCriterium(filename, chunk);
		}
		if (excludeCriterium instanceof RegExp) {
			return excludeCriterium.test(filename);
		}
		// if wrong criteria is passed, we're gonan include the file by default
		return true;
	}

	/**
	 * We need to make sure, that we can actually create the folder.
	 * We can do so, if the desired output is inside project root
	 * @param String outputDir - path to output directory
	 */
	_shouldFolderBeCreated(outputDir) {
		// this returns absolute path
		// handle absolute path, that points to project
		const isAbsolutePathWithProjectRoot = outputDir.includes(process.cwd());
		// if output is inside the folder, we're all good
		const isPathWithinProjectRoot = !outputDir.startsWith('/');
		return (
			isAbsolutePathWithProjectRoot || isPathWithinProjectRoot || false
		);
	}

	/**
	 * To create output folder, we need to understand,
	 * which folders to create. This function normalizes
	 * relative and absolute path, to output we can then
	 * work with - e.g.: folder1/folder2/folder3
	 * @param String outputDir - path to outpurDirectory
	 */
	_normalizeOutputDir(outputDir) {
		const removedRelativePrefix = outputDir.replace(/^\.\//, '');
		return removedRelativePrefix.replace(process.cwd(), '');
	}
}
