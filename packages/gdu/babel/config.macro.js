const { default: template } = require('@babel/template');
const { createMacro, MacroError } = require('babel-plugin-macros');
const {
	getConsumerRuntimeConfig,
} = require('gdu/dist/lib/getConsumerRuntimeConfig');

const configs = [...getConsumerRuntimeConfig()];
const env = process.env.APP_ENV;

const env_config = configs.find((c) => c.name === env);
if (!env_config)
	throw new Error(
		`Unable to find config for this environment.\nAPP_ENV=${env}\nConfigs:\n${configs
			.map((c) => JSON.stringify(c, null, 4))
			.join('\n')}`,
	);

module.exports = createMacro(({ references, state, babel: { types: t } }) => {
	if (!references.default)
		throw new MacroError('Only default imports supported');

	const { default: defaultReference } = references;
	if (defaultReference.length > 1)
		throw new MacroError('Only one import specifier supported');

	const [ref] = defaultReference;

	ref.replaceWith(
		template.ast`() => (${JSON.stringify(env_config.config, null, 4)})`,
	);
});
