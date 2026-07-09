import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { getConfigsDirs } from '../../../utils/configs';
import { baseViteOptions } from '../vite.config';

jest.mock('../../../lib/config', () => ({
	getGuruConfig: jest.fn(() => ({
		outputPath: '/workspace/out',
		mountDOMId: 'root',
		mountDOMClass: 'cls',
		frameless: false,
		standalone: false,
	})),
	getProjectName: jest.fn(() => 'test-app'),
}));

jest.mock('../../shared/externals', () => ({
	getExternals: jest.fn(() => ({})),
}));

jest.mock('../../../lib/roots', () => ({
	PROJECT_ROOT: '/workspace/proj/',
	GDU_ROOT: '/workspace/gdu/',
	CALLING_WORKSPACE_ROOT: '/workspace/ws/',
}));

jest.mock('../../../utils/configs', () => ({
	getBuildEnvs: jest.fn(() => ['dev_au']),
	getConfigsDirs: jest.fn(() => []),
}));

const EMITTER = 'gdu-multi-env-config-emitter';
const ENV_TOKENS = 'gdu-mfe-env-tokens';

type NamedPlugin = { name: string; renderChunk?: unknown };

function configFor(
	multiEnvConfig: boolean,
): ReturnType<typeof baseViteOptions> {
	return baseViteOptions({
		buildEnv: 'dev_au',
		isMultiEnv: false,
		standalone: false,
		multiEnvConfig,
	});
}

function pluginNames(config: ReturnType<typeof baseViteOptions>): string[] {
	return ((config.plugins ?? []) as NamedPlugin[]).map((p) => p.name);
}

function findPlugin(
	config: ReturnType<typeof baseViteOptions>,
	name: string,
): NamedPlugin | undefined {
	return ((config.plugins ?? []) as NamedPlugin[]).find(
		(p) => p.name === name,
	);
}

let configsDir: string;

beforeAll(() => {
	// A single .env.defaults token guarantees mfeEnvTokens is a live plugin
	// (not the empty no-op), so its renderChunk presence reflects bakeInitBlock.
	configsDir = mkdtempSync(join(tmpdir(), 'gdu-vite-config-'));
	writeFileSync(
		join(configsDir, '.env.defaults'),
		'IS_PRODUCTION="#{IS_PRODUCTION}"\n',
	);
	(getConfigsDirs as jest.Mock).mockReturnValue([configsDir]);
});

afterAll(() => {
	if (configsDir) rmSync(configsDir, { recursive: true, force: true });
});

describe('baseViteOptions plugin selection', () => {
	describe('when multiEnvConfig is false (single-env default)', () => {
		it('omits the multi-env config emitter from the plugin list', () => {
			expect(pluginNames(configFor(false))).not.toContain(EMITTER);
		});

		it('constructs mfeEnvTokens with the init-block bake enabled', () => {
			const plugin = findPlugin(configFor(false), ENV_TOKENS);
			expect(plugin).toHaveProperty('renderChunk');
		});
	});

	describe('when multiEnvConfig is true (multi-env opt-in)', () => {
		it('includes the multi-env config emitter in the plugin list', () => {
			expect(pluginNames(configFor(true))).toContain(EMITTER);
		});

		it('constructs mfeEnvTokens without the init-block bake', () => {
			const plugin = findPlugin(configFor(true), ENV_TOKENS);
			expect(plugin).not.toHaveProperty('renderChunk');
		});
	});
});
