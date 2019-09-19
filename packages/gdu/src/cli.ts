import sade from 'sade';

const app = sade('gdu')
	.command('graphql-schema')
	.option('-e, --endpoint', 'The endpoint name to retrieve the schema from.')
	.example('graphql-schema')
	.action(options => {
		runScript(import('./scripts/graphqlSchema'), options);
	});

export default (argv: string[]) => {
	app.parse(argv);
};

function runScript(importee, options) {
	try {
		(async function() {
			const script = await importee;
			await script.run(options);
		})();
	} catch (_) {
		process.exit(1);
	}
}
