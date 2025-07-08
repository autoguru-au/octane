import bugger from 'debug';
import { yellow } from 'kleur';
import { Compiler, MultiCompiler } from 'webpack';

const debug = bugger('gdu:webpack:compile');

const done = (resolve, reject) => (err, stats) => {
	if (err || stats.hasErrors()) {
		reject(err || stats.toString('errors-only'));
		return;
	}

	if (stats.hasWarnings()) {
		const { warnings } = stats.toJson();
		console.log(
			yellow(
				`Compiled with ${warnings.length} warning${
					warnings.length > 1 ? 's' : ''
				}.`,
			),
		);
		for (const i of warnings) debug(i);
	}

	resolve();
};

export const run = async (compiler: Compiler | MultiCompiler) =>
	new Promise((resolve, reject) =>
		compiler.run((err, stats) => {
			compiler.close((err2) => {
				if (err || err2) {
					reject(err || err2);
					return;
				}

				// Log meaningful build output
				if (stats) {
					const statsOptions = {
						colors: true,
						chunks: false,
						modules: false,
						children: false,
						chunkModules: false,
						hash: false,
						version: false,
						timings: true,
						assets: true,
						warnings: true,
						errors: true,
					};

					console.log(stats.toString(statsOptions));
				}

				done(resolve, reject)(err, stats);
			});
		}),
	);

export const watch = async (compiler: Compiler) =>
	new Promise((resolve, reject) => compiler.watch({}, done(resolve, reject)));
