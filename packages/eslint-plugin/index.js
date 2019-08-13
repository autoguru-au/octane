module.exports = {
	rules: require('./rules'),

	configs: {
		base: require('./configs/base'),
		jest: require('./configs/jest'),
		react: require('./configs/react'),
		typescript: require('./configs/typescript'),
	},
};
