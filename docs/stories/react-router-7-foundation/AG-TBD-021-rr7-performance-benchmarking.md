# Story: GDU. Performance. As a Tech Lead, I want React Router 7 performance benchmarks, so that I can validate migration delivers performance improvements

## Story Details

**Story ID**: AG-TBD-021
**Epic**: AG-TBD-001 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Should Have
**Story Points**: 5
**Sprint**: 9

## Description

### Summary
We need to create a comprehensive performance benchmarking suite for React Router 7 SSR applications and compare results against Next.js baselines. This will validate that the migration delivers the promised performance improvements (faster builds, faster HMR, comparable or better runtime performance) and provide data-driven evidence for stakeholders. The benchmarking suite should be automated, repeatable, and generate clear reports.

### Background
One of the primary drivers for migrating to React Router 7 is performance:
- **Build Performance**: Vite is significantly faster than webpack
- **Development Experience**: HMR should be near-instant
- **Runtime Performance**: SSR and client-side should be comparable or better

We need to measure and prove these improvements with hard data. The benchmarks will:
1. Provide objective performance comparison
2. Identify any performance regressions
3. Guide optimization efforts
4. Support the business case for migration
5. Set performance baselines for future work

### User Value
Tech leads and stakeholders have objective performance data proving the migration improves developer experience and maintains or improves user experience, justifying the migration investment.

## User Persona

**Role**: Tech Lead / Engineering Manager
**Name**: "Measure Mary the Metrics Manager"
**Context**: Evaluating whether React Router 7 migration is worthwhile
**Goals**:
- Prove migration improves performance
- Identify any performance regressions early
- Make data-driven decisions
- Set performance budgets
- Track performance over time
**Pain Points**:
- Hard to compare different frameworks objectively
- Performance claims need proof
- Need to justify migration investment
- Need to ensure no user experience degradation

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Benchmarking suite created at `packages/gdu/benchmarks/react-router-performance/` | ☐ | ☐ | ☐ |
| 2 | Build time benchmarks for dev and production | ☐ | ☐ | ☐ |
| 3 | HMR performance benchmarks | ☐ | ☐ | ☐ |
| 4 | Lambda cold start benchmarks | ☐ | ☐ | ☐ |
| 5 | Lambda warm request latency benchmarks | ☐ | ☐ | ☐ |
| 6 | SSR rendering time benchmarks | ☐ | ☐ | ☐ |
| 7 | Client-side hydration time benchmarks | ☐ | ☐ | ☐ |
| 8 | Bundle size comparison | ☐ | ☐ | ☐ |
| 9 | Load testing under concurrent users (k6 or Artillery) | ☐ | ☐ | ☐ |
| 10 | Memory usage benchmarks | ☐ | ☐ | ☐ |
| 11 | Automated benchmark reporting (JSON + HTML) | ☐ | ☐ | ☐ |
| 12 | Comparison report: Next.js vs React Router 7 | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Benchmarks are repeatable (< 5% variance) | ☐ | ☐ | ☐ |
| 2 | Benchmarks run in CI/CD pipeline | ☐ | ☐ | ☐ |
| 3 | Benchmark suite completes within 15 minutes | ☐ | ☐ | ☐ |
| 4 | Reports are clear and actionable | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Benchmark large applications (1000+ routes) | ☐ | ☐ | ☐ |
| 2 | Benchmark under load (100+ concurrent users) | ☐ | ☐ | ☐ |
| 3 | Benchmark with slow network conditions | ☐ | ☐ | ☐ |

## Technical Implementation

### Benchmarking Suite Structure

```
packages/gdu/benchmarks/react-router-performance/
├── src/
│   ├── build-benchmarks.ts         # Build time measurements
│   ├── hmr-benchmarks.ts           # HMR measurements
│   ├── lambda-benchmarks.ts        # Lambda performance
│   ├── ssr-benchmarks.ts           # SSR rendering
│   ├── client-benchmarks.ts        # Client-side performance
│   ├── load-tests.ts               # Load testing
│   └── utils/
│       ├── metrics.ts              # Metrics collection
│       ├── reporter.ts             # Report generation
│       └── comparator.ts           # Framework comparison
├── scripts/
│   ├── run-all-benchmarks.sh       # Run all benchmarks
│   ├── compare-frameworks.sh       # Compare Next.js vs RR7
│   └── generate-report.sh          # Generate HTML report
├── fixtures/
│   ├── nextjs-app/                 # Sample Next.js app
│   └── react-router-app/           # Sample RR7 app
├── results/                        # Benchmark results (gitignored)
│   ├── nextjs/
│   └── react-router/
└── reports/                        # Generated reports
    └── comparison-report.html
```

### Build Time Benchmarks

```typescript
// packages/gdu/benchmarks/react-router-performance/src/build-benchmarks.ts
import { execSync } from 'child_process';
import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';

interface BuildBenchmarkResult {
  framework: 'nextjs' | 'react-router';
  environment: 'dev' | 'prod';
  duration: number;
  buildSize: number;
  timestamp: string;
}

export async function runBuildBenchmarks() {
  const results: BuildBenchmarkResult[] = [];

  // Benchmark Next.js production build
  console.log('Benchmarking Next.js production build...');
  const nextjsProdStart = performance.now();
  execSync('cd fixtures/nextjs-app && next build', { stdio: 'inherit' });
  const nextjsProdDuration = performance.now() - nextjsProdStart;

  results.push({
    framework: 'nextjs',
    environment: 'prod',
    duration: nextjsProdDuration,
    buildSize: getBuildSize('fixtures/nextjs-app/.next'),
    timestamp: new Date().toISOString(),
  });

  // Benchmark React Router production build
  console.log('Benchmarking React Router 7 production build...');
  const rr7ProdStart = performance.now();
  execSync('cd fixtures/react-router-app && gdu build --env prod', { stdio: 'inherit' });
  const rr7ProdDuration = performance.now() - rr7ProdStart;

  results.push({
    framework: 'react-router',
    environment: 'prod',
    duration: rr7ProdDuration,
    buildSize: getBuildSize('fixtures/react-router-app/dist/prod'),
    timestamp: new Date().toISOString(),
  });

  // Save results
  writeFileSync(
    'results/build-benchmarks.json',
    JSON.stringify(results, null, 2)
  );

  // Print summary
  console.log('\n=== Build Benchmark Results ===');
  console.log(`Next.js production build: ${(nextjsProdDuration / 1000).toFixed(2)}s`);
  console.log(`React Router 7 production build: ${(rr7ProdDuration / 1000).toFixed(2)}s`);
  console.log(`Improvement: ${((1 - rr7ProdDuration / nextjsProdDuration) * 100).toFixed(1)}%`);

  return results;
}

function getBuildSize(directory: string): number {
  const output = execSync(`du -sb ${directory}`).toString();
  return parseInt(output.split('\t')[0], 10);
}
```

### HMR Benchmarks

```typescript
// packages/gdu/benchmarks/react-router-performance/src/hmr-benchmarks.ts
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { performance } from 'perf_hooks';

interface HMRBenchmarkResult {
  framework: 'nextjs' | 'react-router';
  updateType: 'simple' | 'complex';
  hmrTime: number;
  timestamp: string;
}

export async function runHMRBenchmarks() {
  const results: HMRBenchmarkResult[] = [];

  // Test Next.js HMR
  console.log('Benchmarking Next.js HMR...');
  const nextjsHMR = await measureHMR('nextjs');
  results.push(...nextjsHMR);

  // Test React Router 7 HMR
  console.log('Benchmarking React Router 7 HMR...');
  const rr7HMR = await measureHMR('react-router');
  results.push(...rr7HMR);

  // Save results
  writeFileSync(
    'results/hmr-benchmarks.json',
    JSON.stringify(results, null, 2)
  );

  return results;
}

async function measureHMR(framework: 'nextjs' | 'react-router'): Promise<HMRBenchmarkResult[]> {
  const results: HMRBenchmarkResult[] = [];

  // Start dev server
  const devServer = framework === 'nextjs'
    ? spawn('next', ['dev'], { cwd: 'fixtures/nextjs-app' })
    : spawn('gdu', ['dev'], { cwd: 'fixtures/react-router-app' });

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Launch browser
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to app
  await page.goto('http://localhost:3000');

  // Measure simple component update
  const simpleUpdateTime = await measureComponentUpdate(page, 'simple');
  results.push({
    framework,
    updateType: 'simple',
    hmrTime: simpleUpdateTime,
    timestamp: new Date().toISOString(),
  });

  // Measure complex component update
  const complexUpdateTime = await measureComponentUpdate(page, 'complex');
  results.push({
    framework,
    updateType: 'complex',
    hmrTime: complexUpdateTime,
    timestamp: new Date().toISOString(),
  });

  // Cleanup
  await browser.close();
  devServer.kill();

  return results;
}

async function measureComponentUpdate(page: any, type: 'simple' | 'complex'): Promise<number> {
  // Set up listener for HMR update
  const hmrPromise = page.waitForEvent('console', {
    predicate: (msg) => msg.text().includes('[HMR]') || msg.text().includes('[vite]'),
  });

  // Modify component file
  const componentPath = type === 'simple'
    ? 'src/components/SimpleComponent.tsx'
    : 'src/components/ComplexComponent.tsx';

  const originalContent = readFileSync(componentPath, 'utf-8');
  const modifiedContent = originalContent.replace(
    'Hello World',
    `Hello World ${Date.now()}`
  );

  const start = performance.now();
  writeFileSync(componentPath, modifiedContent);

  // Wait for HMR to complete
  await hmrPromise;
  const duration = performance.now() - start;

  // Restore original content
  writeFileSync(componentPath, originalContent);

  return duration;
}
```

### Lambda Benchmarks

```typescript
// packages/gdu/benchmarks/react-router-performance/src/lambda-benchmarks.ts
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { performance } from 'perf_hooks';

interface LambdaBenchmarkResult {
  framework: 'nextjs' | 'react-router';
  type: 'cold-start' | 'warm-request';
  duration: number;
  memoryUsed: number;
  timestamp: string;
}

export async function runLambdaBenchmarks() {
  const lambdaClient = new LambdaClient({ region: 'ap-southeast-2' });
  const results: LambdaBenchmarkResult[] = [];

  // Cold start benchmark
  console.log('Benchmarking Lambda cold starts...');

  for (const framework of ['nextjs', 'react-router'] as const) {
    // Trigger cold start by updating function config
    const coldStartResult = await measureColdStart(
      lambdaClient,
      `${framework}-app-dev`
    );
    results.push(coldStartResult);

    // Warm request benchmark
    console.log(`Benchmarking ${framework} warm requests...`);
    const warmResults = await measureWarmRequests(
      lambdaClient,
      `${framework}-app-dev`,
      framework,
      10
    );
    results.push(...warmResults);
  }

  return results;
}

async function measureColdStart(
  client: LambdaClient,
  functionName: string
): Promise<LambdaBenchmarkResult> {
  // Force cold start by updating environment variable
  const updateCommand = new UpdateFunctionConfigurationCommand({
    FunctionName: functionName,
    Environment: {
      Variables: {
        FORCE_COLD_START: Date.now().toString(),
      },
    },
  });
  await client.send(updateCommand);

  // Wait for update to complete
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Invoke function
  const start = performance.now();
  const invokeCommand = new InvokeCommand({
    FunctionName: functionName,
    Payload: JSON.stringify({ path: '/' }),
  });

  const response = await client.send(invokeCommand);
  const duration = performance.now() - start;

  return {
    framework: functionName.includes('nextjs') ? 'nextjs' : 'react-router',
    type: 'cold-start',
    duration,
    memoryUsed: response.ExecutedVersion || 0,
    timestamp: new Date().toISOString(),
  };
}

async function measureWarmRequests(
  client: LambdaClient,
  functionName: string,
  framework: 'nextjs' | 'react-router',
  count: number
): Promise<LambdaBenchmarkResult[]> {
  const results: LambdaBenchmarkResult[] = [];

  for (let i = 0; i < count; i++) {
    const start = performance.now();
    const invokeCommand = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify({ path: '/' }),
    });

    await client.send(invokeCommand);
    const duration = performance.now() - start;

    results.push({
      framework,
      type: 'warm-request',
      duration,
      memoryUsed: 0,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
```

### Load Testing with k6

```typescript
// packages/gdu/benchmarks/react-router-performance/src/load-tests.ts
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

export async function runLoadTests() {
  console.log('Running load tests...');

  // Test Next.js app
  console.log('Load testing Next.js app...');
  const nextjsResults = execSync(
    `k6 run --out json=results/nextjs-load-test.json scripts/load-test.js`,
    {
      env: { TARGET_URL: 'https://nextjs-app-dev.autoguru.com.au' },
    }
  ).toString();

  // Test React Router 7 app
  console.log('Load testing React Router 7 app...');
  const rr7Results = execSync(
    `k6 run --out json=results/rr7-load-test.json scripts/load-test.js`,
    {
      env: { TARGET_URL: 'https://react-router-app-dev.autoguru.com.au' },
    }
  ).toString();

  return {
    nextjs: JSON.parse(nextjsResults),
    reactRouter: JSON.parse(rr7Results),
  };
}
```

```javascript
// packages/gdu/benchmarks/react-router-performance/scripts/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'], // Error rate < 1%
    'errors': ['rate<0.01'],
  },
};

export default function () {
  const routes = ['/', '/about', '/dashboard', '/users/123'];
  const route = routes[Math.floor(Math.random() * routes.length)];

  const response = http.get(`${__ENV.TARGET_URL}${route}`);

  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has content': (r) => r.body.length > 0,
  });

  errorRate.add(!success);

  sleep(1);
}
```

### Report Generation

```typescript
// packages/gdu/benchmarks/react-router-performance/src/utils/reporter.ts
import { readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';

interface BenchmarkReport {
  summary: {
    nextjs: FrameworkSummary;
    reactRouter: FrameworkSummary;
    improvements: Improvements;
  };
  buildPerformance: any[];
  hmrPerformance: any[];
  lambdaPerformance: any[];
  loadTestResults: any;
}

interface FrameworkSummary {
  buildTime: number;
  hmrTime: number;
  coldStart: number;
  warmRequest: number;
  bundleSize: number;
}

interface Improvements {
  buildTime: string;
  hmrTime: string;
  bundleSize: string;
}

export function generateReport(): BenchmarkReport {
  // Load all benchmark results
  const buildResults = JSON.parse(readFileSync('results/build-benchmarks.json', 'utf-8'));
  const hmrResults = JSON.parse(readFileSync('results/hmr-benchmarks.json', 'utf-8'));
  const lambdaResults = JSON.parse(readFileSync('results/lambda-benchmarks.json', 'utf-8'));
  const loadTestResults = {
    nextjs: JSON.parse(readFileSync('results/nextjs-load-test.json', 'utf-8')),
    reactRouter: JSON.parse(readFileSync('results/rr7-load-test.json', 'utf-8')),
  };

  // Calculate summaries
  const nextjsSummary = calculateSummary('nextjs', buildResults, hmrResults, lambdaResults);
  const reactRouterSummary = calculateSummary('react-router', buildResults, hmrResults, lambdaResults);

  // Calculate improvements
  const improvements = {
    buildTime: `${((1 - reactRouterSummary.buildTime / nextjsSummary.buildTime) * 100).toFixed(1)}%`,
    hmrTime: `${((1 - reactRouterSummary.hmrTime / nextjsSummary.hmrTime) * 100).toFixed(1)}%`,
    bundleSize: `${((1 - reactRouterSummary.bundleSize / nextjsSummary.bundleSize) * 100).toFixed(1)}%`,
  };

  const report: BenchmarkReport = {
    summary: {
      nextjs: nextjsSummary,
      reactRouter: reactRouterSummary,
      improvements,
    },
    buildPerformance: buildResults,
    hmrPerformance: hmrResults,
    lambdaPerformance: lambdaResults,
    loadTestResults,
  };

  // Generate HTML report
  generateHTMLReport(report);

  // Save JSON report
  writeFileSync('reports/benchmark-report.json', JSON.stringify(report, null, 2));

  return report;
}

function generateHTMLReport(report: BenchmarkReport) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>React Router 7 vs Next.js Performance Comparison</title>
  <style>
    body { font-family: sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f2f2f2; }
    .improvement { color: green; font-weight: bold; }
    .regression { color: red; font-weight: bold; }
    .chart { margin: 30px 0; }
    h1, h2 { color: #333; }
  </style>
</head>
<body>
  <h1>React Router 7 vs Next.js Performance Comparison</h1>

  <h2>Executive Summary</h2>
  <table>
    <tr>
      <th>Metric</th>
      <th>Next.js</th>
      <th>React Router 7</th>
      <th>Improvement</th>
    </tr>
    <tr>
      <td>Build Time</td>
      <td>${(report.summary.nextjs.buildTime / 1000).toFixed(2)}s</td>
      <td>${(report.summary.reactRouter.buildTime / 1000).toFixed(2)}s</td>
      <td class="improvement">${report.summary.improvements.buildTime}</td>
    </tr>
    <tr>
      <td>HMR Time</td>
      <td>${report.summary.nextjs.hmrTime.toFixed(0)}ms</td>
      <td>${report.summary.reactRouter.hmrTime.toFixed(0)}ms</td>
      <td class="improvement">${report.summary.improvements.hmrTime}</td>
    </tr>
    <tr>
      <td>Lambda Cold Start</td>
      <td>${report.summary.nextjs.coldStart.toFixed(0)}ms</td>
      <td>${report.summary.reactRouter.coldStart.toFixed(0)}ms</td>
      <td>${report.summary.reactRouter.coldStart < report.summary.nextjs.coldStart ? 'class="improvement"' : 'class="regression"'}>${((1 - report.summary.reactRouter.coldStart / report.summary.nextjs.coldStart) * 100).toFixed(1)}%</td>
    </tr>
    <tr>
      <td>Bundle Size</td>
      <td>${(report.summary.nextjs.bundleSize / 1024).toFixed(0)} KB</td>
      <td>${(report.summary.reactRouter.bundleSize / 1024).toFixed(0)} KB</td>
      <td class="improvement">${report.summary.improvements.bundleSize}</td>
    </tr>
  </table>

  <h2>Build Performance</h2>
  <p>Production build times for identical application:</p>
  <div class="chart">
    <!-- Chart would go here -->
  </div>

  <h2>HMR Performance</h2>
  <p>Hot Module Replacement update times:</p>
  <div class="chart">
    <!-- Chart would go here -->
  </div>

  <h2>Lambda Performance</h2>
  <p>AWS Lambda cold start and warm request latencies:</p>
  <div class="chart">
    <!-- Chart would go here -->
  </div>

  <h2>Load Test Results</h2>
  <p>Performance under load (100 concurrent users):</p>
  <div class="chart">
    <!-- Chart would go here -->
  </div>

  <h2>Conclusion</h2>
  <p>
    React Router 7 shows significant improvements in build performance and developer experience,
    with ${report.summary.improvements.buildTime} faster builds and ${report.summary.improvements.hmrTime} faster HMR updates.
    Runtime performance is comparable, with cold starts and warm requests performing similarly to Next.js.
  </p>

  <p>Generated: ${new Date().toISOString()}</p>
</body>
</html>
  `;

  writeFileSync('reports/comparison-report.html', html);
}

function calculateSummary(
  framework: 'nextjs' | 'react-router',
  buildResults: any[],
  hmrResults: any[],
  lambdaResults: any[]
): FrameworkSummary {
  const buildTime = buildResults.find(r => r.framework === framework)?.duration || 0;
  const hmrTime = average(hmrResults.filter(r => r.framework === framework).map(r => r.hmrTime));
  const coldStart = average(lambdaResults.filter(r => r.framework === framework && r.type === 'cold-start').map(r => r.duration));
  const warmRequest = average(lambdaResults.filter(r => r.framework === framework && r.type === 'warm-request').map(r => r.duration));
  const bundleSize = buildResults.find(r => r.framework === framework)?.buildSize || 0;

  return { buildTime, hmrTime, coldStart, warmRequest, bundleSize };
}

function average(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}
```

## UI/UX Specifications

N/A - Performance benchmarking story

## Test Scenarios

### Benchmark Validation
1. Run benchmarks multiple times
2. Verify results are consistent (< 5% variance)
3. Verify all metrics are collected
4. Verify reports are generated

### Comparison Tests
1. Next.js vs React Router 7 with same application
2. Ensure fair comparison (same routes, same data, same environment)
3. Verify improvements are real (not measurement errors)

## Definition of Done

### Development Complete
- [ ] Benchmarking suite created
- [ ] Build time benchmarks implemented
- [ ] HMR benchmarks implemented
- [ ] Lambda benchmarks implemented
- [ ] Load tests implemented
- [ ] Report generation implemented
- [ ] Code reviewed and approved

### Testing Complete
- [ ] Benchmarks run successfully
- [ ] Results are consistent across runs
- [ ] Reports generated correctly
- [ ] Comparison is fair and accurate
- [ ] All metrics collected

### Documentation Complete
- [ ] Benchmarking process documented
- [ ] How to run benchmarks documented
- [ ] How to interpret results documented
- [ ] Comparison report generated

### Deployment Ready
- [ ] Benchmarks run in CI/CD
- [ ] Baseline results established
- [ ] Performance budgets set
- [ ] Monitoring configured

## Dependencies

### Blocked By
- AG-TBD-020: Pilot migration (need real React Router 7 app to benchmark)

### Blocks
- None (can run anytime after pilot migration)

### Related Stories
- All previous stories (benchmarks validate their work)

## Story Points Justification

**Complexity Factors**:
- **Development Complexity**: Medium
  - Multiple benchmark types
  - Integration with CI/CD
  - Report generation

- **Testing Effort**: Medium
  - Validate benchmarks are accurate
  - Ensure repeatability
  - Verify comparisons are fair

- **Integration Points**: 4
  - Build system (Next.js and Vite)
  - AWS Lambda
  - Load testing tools (k6)
  - CI/CD pipeline

- **Unknown Factors**: Low
  - Well-understood metrics
  - Standard tooling available

**Total Points**: 5

## Notes & Decisions

### Technical Decisions
- **k6 for load testing**: Industry standard, powerful
- **Playwright for HMR**: Accurate browser-based measurement
- **AWS SDK for Lambda**: Direct measurement
- **JSON + HTML reports**: Machine and human readable

### Open Questions
- [ ] Should we track metrics over time in database?
- [ ] Should we create dashboard for ongoing monitoring?
- [ ] What performance budgets should we set?
- [ ] Should we gate deployments on performance regression?

### Assumptions
- Pilot app is representative of other apps
- Test environment is stable and consistent
- Lambda configuration is identical for comparison
- Network conditions are similar

### Success Criteria
- Build time improved by > 50%
- HMR time improved by > 80%
- Runtime performance within 10% of Next.js
- Reports are clear and actionable

### Files to Create

```
packages/gdu/benchmarks/react-router-performance/
├── src/
│   ├── build-benchmarks.ts
│   ├── hmr-benchmarks.ts
│   ├── lambda-benchmarks.ts
│   ├── load-tests.ts
│   └── utils/
│       ├── reporter.ts
│       └── comparator.ts
├── scripts/
│   ├── run-all-benchmarks.sh
│   ├── load-test.js
│   └── generate-report.sh
├── fixtures/
│   ├── nextjs-app/
│   └── react-router-app/
└── package.json
```
