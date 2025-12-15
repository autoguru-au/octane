# Story: PM. Build Tooling. As a Developer, I want build comparison tooling, so that I can validate webpack and Vite outputs are equivalent

## Story Details

**Story ID**: AG-TBD-009
**Epic**: AG-EPIC-VITE - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Should Have
**Story Points**: 3
**Sprint**: Sprint 3

## Description

### Summary
Create CLI tooling to automatically compare webpack and Vite build outputs, validating bundle sizes, manifest structure, file lists, and identifying discrepancies. This accelerates migration validation and provides confidence that Vite builds are equivalent.

### User Value
Developers can quickly validate Vite builds against webpack without manual inspection, saving time and reducing errors during migration.

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Given CLI command `gdu compare-builds`, When executed, Then webpack and Vite builds are compared | ☐ | ☐ | ☐ |
| 2 | Given comparison, When analyzing manifests, Then structural differences are reported | ☐ | ☐ | ☐ |
| 3 | Given comparison, When analyzing bundles, Then size differences are reported with percentages | ☐ | ☐ | ☐ |
| 4 | Given comparison, When validating assets, Then missing or extra files are listed | ☐ | ☐ | ☐ |
| 5 | Given comparison results, When generating report, Then JSON and console formats are supported | ☐ | ☐ | ☐ |
| 6 | Given thresholds, When exceeded, Then command exits with error code for CI/CD | ☐ | ☐ | ☐ |

## Technical Implementation

```typescript
// packages/gdu/commands/compare-builds/index.ts
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { cyan, green, red, yellow } from 'kleur';
import { table } from 'table';

interface ComparisonResult {
  passed: boolean;
  webpack: BuildAnalysis;
  vite: BuildAnalysis;
  differences: BuildDifferences;
}

interface BuildAnalysis {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  fileCount: number;
  manifest: any;
  assets: string[];
}

interface BuildDifferences {
  sizeChange: number; // percentage
  fileCountChange: number;
  manifestDiffs: string[];
  missingFiles: string[];
  extraFiles: string[];
}

export default async ({ env = 'prod', threshold = 15 }) => {
  console.log(cyan('Comparing webpack and Vite builds...'));

  const webpackPath = join(process.cwd(), 'dist', env);
  const vitePath = join(process.cwd(), 'dist-vite', env);

  const webpackAnalysis = analyzeBuild(webpackPath, 'webpack');
  const viteAnalysis = analyzeBuild(vitePath, 'vite');

  const differences = calculateDifferences(webpackAnalysis, viteAnalysis);
  const passed = validateThresholds(differences, threshold);

  printReport({
    passed,
    webpack: webpackAnalysis,
    vite: viteAnalysis,
    differences,
  });

  if (!passed) {
    console.log(red('\n❌ Comparison failed: Differences exceed threshold'));
    process.exit(1);
  }

  console.log(green('\n✅ Comparison passed: Builds are equivalent'));
};

function analyzeBuild(buildPath: string, bundler: string): BuildAnalysis {
  console.log(cyan(`Analyzing ${bundler} build at ${buildPath}...`));

  const files = readdirSync(buildPath, { recursive: true }) as string[];
  const jsFiles = files.filter(f => f.endsWith('.js') && !f.endsWith('.map'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  const jsSize = jsFiles.reduce((sum, file) => {
    return sum + statSync(join(buildPath, file)).size;
  }, 0);

  const cssSize = cssFiles.reduce((sum, file) => {
    return sum + statSync(join(buildPath, file)).size;
  }, 0);

  const manifestPath = join(buildPath, 'build-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  return {
    totalSize: jsSize + cssSize,
    jsSize,
    cssSize,
    fileCount: files.length,
    manifest,
    assets: files,
  };
}

function calculateDifferences(
  webpack: BuildAnalysis,
  vite: BuildAnalysis
): BuildDifferences {
  const sizeChange = ((vite.totalSize - webpack.totalSize) / webpack.totalSize) * 100;

  const webpackAssets = new Set(webpack.assets);
  const viteAssets = new Set(vite.assets);

  const missingFiles = webpack.assets.filter(f => !viteAssets.has(f));
  const extraFiles = vite.assets.filter(f => !webpackAssets.has(f));

  const manifestDiffs = compareManifests(webpack.manifest, vite.manifest);

  return {
    sizeChange,
    fileCountChange: vite.fileCount - webpack.fileCount,
    manifestDiffs,
    missingFiles,
    extraFiles,
  };
}

function compareManifests(webpack: any, vite: any): string[] {
  const diffs: string[] = [];

  // Compare structure
  const webpackKeys = Object.keys(webpack).sort();
  const viteKeys = Object.keys(vite).sort();

  const missingKeys = webpackKeys.filter(k => !viteKeys.includes(k));
  const extraKeys = viteKeys.filter(k => !webpackKeys.includes(k));

  if (missingKeys.length > 0) {
    diffs.push(`Missing keys in Vite manifest: ${missingKeys.join(', ')}`);
  }
  if (extraKeys.length > 0) {
    diffs.push(`Extra keys in Vite manifest: ${extraKeys.join(', ')}`);
  }

  // Compare values (ignoring hash-specific differences)
  if (webpack.mountDOMId !== vite.mountDOMId) {
    diffs.push(`mountDOMId differs: "${webpack.mountDOMId}" vs "${vite.mountDOMId}"`);
  }

  if (webpack.assets.js.length !== vite.assets.js.length) {
    diffs.push(`JS asset count differs: ${webpack.assets.js.length} vs ${vite.assets.js.length}`);
  }

  return diffs;
}

function validateThresholds(diffs: BuildDifferences, threshold: number): boolean {
  return Math.abs(diffs.sizeChange) <= threshold && diffs.manifestDiffs.length === 0;
}

function printReport(result: ComparisonResult) {
  console.log('\n' + cyan('Build Comparison Report'));
  console.log(cyan('='.repeat(60)));

  // Size comparison table
  const sizeData = [
    ['Metric', 'Webpack', 'Vite', 'Change'],
    [
      'Total Size',
      formatBytes(result.webpack.totalSize),
      formatBytes(result.vite.totalSize),
      formatChange(result.differences.sizeChange),
    ],
    [
      'JS Size',
      formatBytes(result.webpack.jsSize),
      formatBytes(result.vite.jsSize),
      formatChange(
        ((result.vite.jsSize - result.webpack.jsSize) / result.webpack.jsSize) * 100
      ),
    ],
    [
      'CSS Size',
      formatBytes(result.webpack.cssSize),
      formatBytes(result.vite.cssSize),
      formatChange(
        ((result.vite.cssSize - result.webpack.cssSize) / result.webpack.cssSize) * 100
      ),
    ],
    [
      'File Count',
      result.webpack.fileCount.toString(),
      result.vite.fileCount.toString(),
      result.differences.fileCountChange.toString(),
    ],
  ];

  console.log('\n' + table(sizeData));

  // Manifest differences
  if (result.differences.manifestDiffs.length > 0) {
    console.log(yellow('\n⚠️  Manifest Differences:'));
    result.differences.manifestDiffs.forEach(diff => {
      console.log(yellow(`  - ${diff}`));
    });
  } else {
    console.log(green('\n✓ Manifests are structurally equivalent'));
  }

  // Missing/extra files
  if (result.differences.missingFiles.length > 0) {
    console.log(red('\n❌ Files missing in Vite build:'));
    result.differences.missingFiles.slice(0, 10).forEach(file => {
      console.log(red(`  - ${file}`));
    });
    if (result.differences.missingFiles.length > 10) {
      console.log(red(`  ... and ${result.differences.missingFiles.length - 10} more`));
    }
  }

  if (result.differences.extraFiles.length > 0) {
    console.log(yellow('\n⚠️  Extra files in Vite build:'));
    result.differences.extraFiles.slice(0, 10).forEach(file => {
      console.log(yellow(`  - ${file}`));
    });
    if (result.differences.extraFiles.length > 10) {
      console.log(yellow(`  ... and ${result.differences.extraFiles.length - 10} more`));
    }
  }
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function formatChange(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  const color = percentage > 0 ? red : percentage < -5 ? green : yellow;
  return color(`${sign}${percentage.toFixed(2)}%`);
}
```

### CLI Integration

```typescript
// packages/gdu/cli.ts (add command)
.command('compare-builds')
  .description('Compare webpack and Vite build outputs')
  .option('-e, --env <environment>', 'Environment to compare', 'prod')
  .option('-t, --threshold <percentage>', 'Size difference threshold (%)', '15')
  .option('-o, --output <format>', 'Output format: console, json', 'console')
  .action(compareBuilds);
```

### CI/CD Integration

```yaml
# .github/workflows/pr-validation.yml
- name: Build with both bundlers
  run: |
    yarn build --bundler webpack
    yarn build --bundler vite

- name: Compare builds
  run: yarn gdu compare-builds --threshold 15
```

## Definition of Done

- [x] CLI command implemented
- [x] Comparison logic covers manifests, sizes, files
- [x] Report formatting (console and JSON)
- [x] Threshold validation for CI/CD
- [x] Tests written
- [x] Documentation added

## Dependencies

**Blocked By**: AG-TBD-004, AG-TBD-006
**Supports**: AG-TBD-008 (Pilot migration validation)

## Story Points: 3

**Complexity**: Low-Medium - CLI tooling with comparison logic
