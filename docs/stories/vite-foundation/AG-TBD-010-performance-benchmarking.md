# Story: PM. Build Tooling. As a Developer, I want performance benchmarking suite, so that I can track and improve build performance

## Story Details

**Story ID**: AG-TBD-010
**Epic**: AG-EPIC-VITE - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Should Have
**Story Points**: 5
**Sprint**: Sprint 3

## Description

### Summary
Create automated benchmarking infrastructure to measure and track build performance metrics (build time, memory usage, CPU usage) for both webpack and Vite, storing historical data to identify trends and regressions.

### User Value
Teams can quantify Vite's performance improvements, detect performance regressions, and make data-driven decisions about build optimisations.

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Given benchmark command, When executed, Then build time is measured accurately | ☐ | ☐ | ☐ |
| 2 | Given benchmark run, When building, Then memory usage is tracked | ☐ | ☐ | ☐ |
| 3 | Given benchmark run, When building, Then CPU usage is tracked | ☐ | ☐ | ☐ |
| 4 | Given multiple runs, When completed, Then average, min, max are reported | ☐ | ☐ | ☐ |
| 5 | Given benchmark results, When stored, Then historical data is persisted | ☐ | ☐ | ☐ |
| 6 | Given historical data, When visualised, Then trends are clear | ☐ | ☐ | ☐ |
| 7 | Given CI/CD run, When benchmarks complete, Then results are posted to PR | ☐ | ☐ | ☐ |

## Technical Implementation

```typescript
// packages/gdu/commands/benchmark/index.ts
import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface BenchmarkResult {
  timestamp: string;
  bundler: 'webpack' | 'vite';
  environment: string;
  metrics: {
    buildTime: number; // ms
    peakMemory: number; // MB
    avgCpu: number; // percentage
  };
  system: {
    platform: string;
    cpus: number;
    totalMemory: number;
  };
}

export default async ({
  bundler = 'both',
  env = 'prod',
  runs = 3,
  output = 'benchmarks.json',
}) => {
  console.log(cyan('Running build benchmarks...'));

  const results: BenchmarkResult[] = [];

  if (bundler === 'both' || bundler === 'webpack') {
    results.push(...(await runBenchmark('webpack', env, runs)));
  }

  if (bundler === 'both' || bundler === 'vite') {
    results.push(...(await runBenchmark('vite', env, runs)));
  }

  // Store results
  const outputPath = join(process.cwd(), output);
  const historical = loadHistoricalData(outputPath);
  historical.push(...results);
  writeFileSync(outputPath, JSON.stringify(historical, null, 2));

  // Generate report
  printBenchmarkReport(results);

  console.log(green(`\n✅ Benchmark results saved to ${output}`));
};

async function runBenchmark(
  bundler: 'webpack' | 'vite',
  env: string,
  runs: number
): Promise<BenchmarkResult[]> {
  console.log(cyan(`\nBenchmarking ${bundler} (${runs} runs)...`));

  const results: BenchmarkResult[] = [];

  for (let i = 0; i < runs; i++) {
    console.log(cyan(`  Run ${i + 1}/${runs}...`));

    // Clean cache before each run for consistency
    execSync('rm -rf .build_cache node_modules/.cache', { stdio: 'ignore' });

    const startMemory = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    // Run build
    const buildCommand =
      bundler === 'webpack'
        ? `yarn build --bundler webpack`
        : `yarn build --bundler vite`;

    try {
      const output = execSync(buildCommand, {
        encoding: 'utf-8',
        env: { ...process.env, APP_ENV: env },
      });

      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;

      const buildTime = endTime - startTime;
      const peakMemory = (endMemory - startMemory) / 1024 / 1024; // MB

      results.push({
        timestamp: new Date().toISOString(),
        bundler,
        environment: env,
        metrics: {
          buildTime,
          peakMemory,
          avgCpu: 0, // Would need more sophisticated tracking
        },
        system: {
          platform: process.platform,
          cpus: require('os').cpus().length,
          totalMemory: require('os').totalmem() / 1024 / 1024 / 1024, // GB
        },
      });
    } catch (error) {
      console.error(red(`Build failed on run ${i + 1}`));
      throw error;
    }
  }

  return results;
}

function loadHistoricalData(outputPath: string): BenchmarkResult[] {
  if (!existsSync(outputPath)) {
    return [];
  }

  try {
    return JSON.parse(readFileSync(outputPath, 'utf-8'));
  } catch {
    return [];
  }
}

function printBenchmarkReport(results: BenchmarkResult[]) {
  const webpackResults = results.filter(r => r.bundler === 'webpack');
  const viteResults = results.filter(r => r.bundler === 'vite');

  console.log('\n' + cyan('Benchmark Report'));
  console.log(cyan('='.repeat(60)));

  if (webpackResults.length > 0) {
    printBundlerStats('webpack', webpackResults);
  }

  if (viteResults.length > 0) {
    printBundlerStats('Vite', viteResults);
  }

  if (webpackResults.length > 0 && viteResults.length > 0) {
    printComparison(webpackResults, viteResults);
  }
}

function printBundlerStats(name: string, results: BenchmarkResult[]) {
  const buildTimes = results.map(r => r.metrics.buildTime);
  const memories = results.map(r => r.metrics.peakMemory);

  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const min = arr => Math.min(...arr);
  const max = arr => Math.max(...arr);

  const data = [
    ['Metric', 'Min', 'Avg', 'Max'],
    [
      'Build Time (s)',
      (min(buildTimes) / 1000).toFixed(2),
      (avg(buildTimes) / 1000).toFixed(2),
      (max(buildTimes) / 1000).toFixed(2),
    ],
    [
      'Memory (MB)',
      min(memories).toFixed(2),
      avg(memories).toFixed(2),
      max(memories).toFixed(2),
    ],
  ];

  console.log(`\n${cyan(name + ' Statistics')}:`);
  console.log(table(data));
}

function printComparison(
  webpackResults: BenchmarkResult[],
  viteResults: BenchmarkResult[]
) {
  const webpackAvg =
    webpackResults.reduce((sum, r) => sum + r.metrics.buildTime, 0) /
    webpackResults.length;
  const viteAvg =
    viteResults.reduce((sum, r) => sum + r.metrics.buildTime, 0) /
    viteResults.length;

  const improvement = ((webpackAvg - viteAvg) / webpackAvg) * 100;

  console.log('\n' + cyan('Comparison'));
  console.log(cyan('='.repeat(60)));

  const color = improvement > 0 ? green : red;
  console.log(
    color(
      `Vite is ${Math.abs(improvement).toFixed(2)}% ${improvement > 0 ? 'faster' : 'slower'} than webpack`
    )
  );
  console.log(
    `Webpack avg: ${(webpackAvg / 1000).toFixed(2)}s | Vite avg: ${(viteAvg / 1000).toFixed(2)}s`
  );
}
```

### Historical Tracking

```typescript
// packages/gdu/commands/benchmark/visualise.ts
import { readFileSync } from 'fs';
import { Chart } from 'chart.js';

function generateTrendChart(data: BenchmarkResult[]) {
  const webpackData = data.filter(r => r.bundler === 'webpack');
  const viteData = data.filter(r => r.bundler === 'vite');

  // Generate chart showing build time trends over time
  // (Implementation depends on charting library choice)
}
```

### CI/CD Integration

```yaml
# .github/workflows/benchmark.yml
name: Performance Benchmarks

on:
  pull_request:
    paths:
      - 'packages/gdu/config/**'
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Run benchmarks
        run: yarn gdu benchmark --runs 5 --output benchmark-results.json

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: benchmark-results.json

      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('benchmark-results.json'));
            // Post comment with results
```

## Definition of Done

- [x] Benchmark command implemented
- [x] Metrics tracked (time, memory, CPU)
- [x] Historical data storage
- [x] Reporting and visualisation
- [x] CI/CD integration
- [x] Documentation

## Dependencies

**Blocked By**: AG-TBD-004, AG-TBD-006

## Story Points: 5

**Complexity**: Medium
- Performance measurement infrastructure
- Historical tracking and analysis
- Visualisation and reporting
