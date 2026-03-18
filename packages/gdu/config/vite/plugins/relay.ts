import type { VitePlugin } from '../types';

export function relayPlugin(rawArtifactDirectory: string): VitePlugin {
	const artifactDirectory = rawArtifactDirectory.replaceAll('\\', '/');
	const graphqlTagRegex = /graphql\s*`\s*([\s\S]*?)`/g;
	const operationNameRegex =
		/(?:query|mutation|subscription|fragment)\s+(\w+)/;

	return {
		name: 'gdu-relay',
		transform(code, id) {
			if (!/\.[jt]sx?$/.test(id)) return null;
			if (id.includes('node_modules') || id.includes('__generated__'))
				return null;
			if (!code.includes('graphql`')) return null;

			const imports: string[] = [];
			let counter = 0;

			const newCode = code.replace(
				graphqlTagRegex,
				(_match, graphqlText: string) => {
					const nameMatch = graphqlText.match(operationNameRegex);
					if (!nameMatch) return _match;

					const operationName = nameMatch[1];
					const varName = `__relayArtifact${counter++}`;
					imports.push(
						`import ${varName} from "${artifactDirectory}/${operationName}.graphql";`,
					);
					return varName;
				},
			);

			if (imports.length === 0) return null;

			return { code: imports.join('\n') + '\n' + newCode, map: null };
		},
	};
}
