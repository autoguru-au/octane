module.exports = () => {


	return {
		name: '@autoguru/config',
		visitor: {
			ImportDeclaration(path) {

				if (path.node.source.value === '@autoguru/config') {
					console.log(path.node);
				}

			},
		},
	};

};
