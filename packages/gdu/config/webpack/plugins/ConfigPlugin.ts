// @ts-nocheck

import { Compiler } from 'webpack';
import { ConcatSource } from 'webpack-sources';
import ChunkGroup from 'webpack/lib/ChunkGroup';
import HarmonyExportImportedSpecifierDependency from 'webpack/lib/dependencies/HarmonyExportImportedSpecifierDependency';
import HarmonyImportSpecifierDependency from 'webpack/lib/dependencies/HarmonyImportSpecifierDependency';
import NullDependency from 'webpack/lib/dependencies/NullDependency';
import GraphHelpers from 'webpack/lib/GraphHelpers';
import Module from 'webpack/lib/Module';
import createHash from 'webpack/lib/util/createHash';

interface Options {
	getConfig: () => Iterable<{ name: string; config: any }>;
	alterPublicPath: boolean;
}

const CONFIG_EXPORT_SYMBOL = 'a';

const PLUGIN_NAME = 'ConfigPlugin';

export default class ConfigPlugin {
	private readonly _configMap = new Map();

	constructor(private readonly _options: Options) {
		for (const env of _options.getConfig()) {
			this._configMap.set(env.name, env.config);
		}
	}

	apply(compiler: Compiler) {
		compiler.hooks.thisCompilation.tap(PLUGIN_NAME, compilation => {
			compilation.hooks.moduleIds.tap(PLUGIN_NAME, modules => {
				for (const mod of modules) {
					if (mod.constructor.name === EnvConfigModule.name) {
						mod.id = createHash('md5')
							.update('env config module')
							.digest('hex')
							.substr(0, 4);
					}
				}
			});
		});

		compiler.hooks.compile.tap(PLUGIN_NAME, ({ normalModuleFactory }) => {
			normalModuleFactory.hooks.resolver.tap(PLUGIN_NAME, resolver => {
				return (data, callback) => {
					if (data?.request === 'gdu/config') {
						return callback(
							null,
							new ConfigModule({
								issuer: data?.contextInfo?.issuer,
								context: data?.context,
								configs: this._configMap,
								alterPublicPath: this._options.alterPublicPath,
							}),
						);
					}

					return resolver(data, callback);
				};
			});
		});
	}
}

// The module for gdu/config
class ConfigModule extends Module {
	constructor(private readonly options: any) {
		const { issuer, context, configs } = options;

		super('javascript/esm', context);

		// @ts-ignore
		this.issuer = issuer;

		this._configMap = configs;
	}

	libIdent({ context }) {
		return 'config module';
	}

	identifier() {
		return 'config wrapper module';
	}

	readableIdentifier() {
		return 'config wrapper module';
	}

	needRebuild() {
		return !this.buildMeta;
	}

	hasDependencies() {
		return true;
	}

	build(options, compilation, resolver, fs, callback) {
		this.built = true;
		this.buildMeta = {
			exportsType: 'namespace',
			providedExports: ['default'],
		};
		this.buildInfo = {
			strict: true,
			cacheable: true,
			exportsArgument: '__webpack_exports__',
			deps: [],
		};

		this.dependencies = [];

		const buildModule = async mod =>
			new Promise((resolve, reject) =>
				compilation.buildModule(mod, false, this, [], err => {
					if (err) return reject(err);
					resolve();
				}),
			);

		const makeChunkForEnv = (name, config) =>
			new Promise((resolve, reject) => {
				const newChunk = compilation.addChunk(`env-${name}`);
				newChunk.id = 0;
				newChunk.ids = [0];
				newChunk.chunkReason = `config for ${name}`;
				newChunk._isEnvironmentChunk = true;
				newChunk._environmentName = name;
				newChunk.preventIntegration = true;

				const mod = new EnvConfigModule({
					name,
					config,
				});

				const dep = new EnvConfigDependency(mod);

				this.buildInfo.deps.push(dep);

				// TODO: Hoist this module to the root, but figure out a way to get it an id, maybe push this to the
				// main entry instead, and get it require the dep directly?
				const entryModule = new ConfigEntryModule(this, name, dep);

				const entry = new ChunkGroup('config entry');

				compilation.addModule(mod);

				GraphHelpers.connectChunkGroupAndChunk(entry, newChunk);
				GraphHelpers.connectChunkAndModule(newChunk, mod);

				if (this.options.alterPublicPath) {
					compilation.addModule(entryModule);
					GraphHelpers.connectChunkAndModule(newChunk, entryModule);

					newChunk.entryModule = entryModule;
				}

				return Promise.all([buildModule(mod), buildModule(entryModule)])
					.then(() => void resolve())
					.catch(reject);
			});

		const configMapPromises = [];

		for (const [cfgName, cfg] of this._configMap.entries()) {
			configMapPromises.push(makeChunkForEnv(cfgName, cfg));
		}

		Promise.all(configMapPromises)
			.catch(error => callback(error))
			.then(() => void callback());
	}

	source(dependencyTemplates, runtimeTemplate) {
		const importVar = '__CONFIG__';

		const reExport = dependencyTemplates.get(
			HarmonyExportImportedSpecifierDependency,
		);
		const importSpec = dependencyTemplates.get(
			HarmonyImportSpecifierDependency,
		);

		// Pick the first one, as they _should_ all point to the same module id
		const { module } = this.buildInfo.deps[0];

		const useConfigExport = importSpec.getContent(
			{
				_module: module,
				_id: CONFIG_EXPORT_SYMBOL,
				request: module.id,
				originModule: this,
				shorthand: false,
				call: false,
				directImport: false,
				getImportVar() {
					return importVar;
				},
			},
			runtimeTemplate,
		);

		return new ConcatSource(
			// Make it an ESModule
			runtimeTemplate.defineEsModuleFlagStatement(this.buildInfo),

			// Import this _magic_ config
			runtimeTemplate.importStatement({
				update: false,
				module,
				request: module.id,
				importVar,
				originModule: this,
			}),
			'\n',
			reExport.getContent({
				getMode() {
					return { type: 'reexport-named-default', name: 'default' };
				},
				originModule: this,
				_module: module,
				getImportVar() {
					return useConfigExport;
				},
			}),
		);
	}

	size() {
		return 42;
	}
}

class EnvConfigDependency extends NullDependency {
	constructor(module) {
		super();

		this.module = module;
	}
}

class ConfigEntryModule extends Module {
	constructor(
		public issuer,
		private readonly _env,
		private readonly _configDep,
	) {
		super('javascript/esm', null);
	}

	identifier() {
		return `config entry module ${this._env}`;
	}

	readableIdentifier() {
		return `config entry module`;
	}

	build(options, compilation, resolver, fs, callback) {
		this.buildMeta = {};
		this.buildInfo = {
			strict: true,
		};

		callback();
	}

	hasDependencies() {
		return true;
	}

	source(dependencyTemplates, runtimeTemplate) {
		const importSpec = dependencyTemplates.get(
			HarmonyImportSpecifierDependency,
		);

		const importVar = '__CONFIG__';

		const useConfigExport = importSpec.getContent(
			{
				_module: this._configDep.module,
				_id: CONFIG_EXPORT_SYMBOL,
				request: this._configDep.module.id,
				originModule: this,
				shorthand: false,
				call: false,
				directImport: false,
				getImportVar() {
					return importVar;
				},
			},
			runtimeTemplate,
		);

		return new ConcatSource(
			runtimeTemplate.importStatement({
				update: false,
				module: this._configDep.module,
				request: this._configDep.module.id,
				importVar,
				originModule: this,
			}),
			`if (typeof ${useConfigExport}['publicPathBase'] !== 'undefined') {
				__webpack_require__.p = ${useConfigExport}['publicPathBase'] + __webpack_require__.p;
			}`,
		);
	}

	size() {
		return 42;
	}
}

class EnvConfigModule extends Module {
	constructor(private readonly _config: { name: string; config: any }) {
		super('javascript/esm', null);
	}

	identifier() {
		return `config ${this._config.name} module`;
	}

	readableIdentifier() {
		return `config ${this._config.name} module`;
	}

	hasDependencies() {
		return true;
	}

	needRebuild() {
		return !this.buildMeta;
	}

	isUsed(thing) {
		return thing;
	}

	build(options, compilation, resolver, fs, callback) {
		this.built = true;
		this.buildMeta = {
			exportsType: 'namespace',
			providedExports: ['default'],
		};
		this.buildInfo = {
			strict: true,
			cacheable: true,
			exportsArgument: '__webpack_exports__',
		};

		callback();
	}

	source(dependencyTemplates, runtimeTemplate) {
		const source = new ConcatSource();

		source.add(runtimeTemplate.defineEsModuleFlagStatement(this.buildInfo));

		source.add(
			`__webpack_require__.d(${
				this.buildInfo.exportsArgument
			}, '${CONFIG_EXPORT_SYMBOL}', function() { return ${JSON.stringify({
				name: this._config.name,
				...this._config.config,
			})}; });`,
		);

		return source;
	}

	size() {
		return 42;
	}

	updateHash(hash) {
		hash.update(JSON.stringify(this._config));
	}
}
