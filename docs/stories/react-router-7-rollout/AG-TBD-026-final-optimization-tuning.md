# Story: GDU. Build Optimization. As a Platform Engineer, I want to optimize and tune all migrated React Router 7 applications, so that we maximize performance, minimize costs, and deliver the best user experience

## Story Details

**Story ID**: AG-TBD-026
**Epic**: AG-TBD-000 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Should Have
**Story Points**: 8
**Sprint**: Sprint 12

## Description

### Summary
After successfully migrating all SSR applications to React Router 7 (internal apps, supplier portal, fleet management, and marketplace), we need to optimize and tune the entire platform for maximum performance, cost-efficiency, and reliability. This story focuses on analyzing real-world production data, identifying optimization opportunities, and implementing improvements across all migrated applications.

This is not feature development - it's systematic performance engineering based on actual production metrics and user behavior patterns we've observed during the migrations.

### Background
Throughout the migration process (AG-TBD-022 through AG-TBD-025), we've deployed applications incrementally and gathered valuable production data:
- Lambda performance metrics (cold starts, duration, memory usage)
- CloudFront cache hit rates and performance
- User behavior patterns and traffic distribution
- Cost breakdown by application
- Bundle sizes and optimization opportunities
- Database query patterns
- API response times

With all applications now running on RR7, we can analyze the complete picture and implement platform-wide optimizations that benefit all applications. Some optimizations weren't possible during individual migrations due to lack of production data, while others have emerged as patterns across multiple applications.

### User Value
End users across all platforms (consumers, suppliers, fleet controllers, internal users) benefit from faster page loads, more responsive interactions, and improved reliability. The business benefits from reduced infrastructure costs while maintaining or improving service quality.

## User Persona

**Role**: Platform Engineer
**Name**: "Alex the Platform Engineer"
**Context**: Responsible for platform performance, reliability, and cost optimization across all AutoGuru applications
**Goals**: Maximize performance, minimize costs, ensure reliability, improve developer experience
**Pain Points**: Balancing performance vs cost, identifying bottlenecks across distributed systems, prioritizing optimizations with highest ROI

## Acceptance Criteria

### Performance Optimization

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Lambda cold start times improved by 20%+ across all apps | ☐ | ☐ | ☐ |
| 2 | Lambda memory usage optimized (right-sizing) | ☐ | ☐ | ☐ |
| 3 | Bundle sizes reduced by 15%+ | ☐ | ☐ | ☐ |
| 4 | CloudFront cache hit rate improved to 85%+ | ☐ | ☐ | ☐ |
| 5 | Database query optimizations implemented | ☐ | ☐ | ☐ |
| 6 | Image optimization implemented (WebP, lazy loading) | ☐ | ☐ | ☐ |
| 7 | Font loading optimized (preload, subset) | ☐ | ☐ | ☐ |
| 8 | Eliminate render-blocking resources | ☐ | ☐ | ☐ |
| 9 | Code splitting optimized for common patterns | ☐ | ☐ | ☐ |
| 10 | Lighthouse scores improved by 5+ points per app | ☐ | ☐ | ☐ |

### Cost Optimization

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Lambda costs reduced by 20%+ (right-sizing memory) | ☐ | ☐ | ☐ |
| 2 | Provisioned concurrency optimized per traffic patterns | ☐ | ☐ | ☐ |
| 3 | CloudFront costs analyzed and optimized | ☐ | ☐ | ☐ |
| 4 | S3 storage costs optimized (lifecycle policies) | ☐ | ☐ | ☐ |
| 5 | API call reduction strategies implemented | ☐ | ☐ | ☐ |
| 6 | Cost dashboard created showing per-app breakdown | ☐ | ☐ | ☐ |

### Reliability Improvements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Error handling improved across all apps | ☐ | ☐ | ☐ |
| 2 | Retry logic implemented for transient failures | ☐ | ☐ | ☐ |
| 3 | Circuit breakers added for external service calls | ☐ | ☐ | ☐ |
| 4 | Graceful degradation patterns implemented | ☐ | ☐ | ☐ |
| 5 | Health check endpoints optimized | ☐ | ☐ | ☐ |

### Monitoring & Observability

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Consolidated dashboard for all RR7 apps created | ☐ | ☐ | ☐ |
| 2 | Performance budgets defined and monitored | ☐ | ☐ | ☐ |
| 3 | Cost anomaly detection configured | ☐ | ☐ | ☐ |
| 4 | Synthetic monitoring implemented for critical paths | ☐ | ☐ | ☐ |
| 5 | Custom metrics for business KPIs implemented | ☐ | ☐ | ☐ |

## Technical Implementation

### Phase 1: Analysis and Data Collection

#### 1.1 Performance Analysis
```bash
# Analyze Lambda performance across all apps
npm run analyze:lambda-performance

# Output: JSON report with:
# - Cold start distribution (p50, p95, p99)
# - Memory utilization patterns
# - Duration patterns
# - Cost per invocation
# - Recommendations
```

**Key Metrics to Analyze**:
- Lambda cold start times per application
- Lambda memory utilization (over-provisioned?)
- Lambda duration patterns
- CloudFront cache hit rates
- Bundle sizes and dependencies
- Database query performance
- API response times
- Error rates and patterns

#### 1.2 Cost Analysis
```typescript
// scripts/analyze-costs.ts
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer';

async function analyzeCosts() {
  const costExplorer = new CostExplorerClient({ region: 'us-east-1' });

  // Get costs by service for last 30 days
  const costs = await costExplorer.send(
    new GetCostAndUsageCommand({
      TimePeriod: {
        Start: getDate(-30),
        End: getDate(0),
      },
      Granularity: 'DAILY',
      Metrics: ['UnblendedCost'],
      GroupBy: [
        { Type: 'DIMENSION', Key: 'SERVICE' },
        { Type: 'TAG', Key: 'Application' },
      ],
    })
  );

  // Analyze per application
  const breakdown = {
    'internal-apps': calculateAppCost(costs, 'internal-apps'),
    'supplier-portal': calculateAppCost(costs, 'supplier-portal'),
    'fleet-management': calculateAppCost(costs, 'fleet-management'),
    marketplace: calculateAppCost(costs, 'marketplace'),
  };

  // Identify optimization opportunities
  const recommendations = generateCostRecommendations(breakdown);

  return { breakdown, recommendations };
}
```

#### 1.3 Bundle Analysis
```bash
# Analyze bundle composition for each app
cd packages/gdu/apps/marketplace
npx vite-bundle-visualizer

# Check for:
# - Duplicate dependencies across apps
# - Large dependencies that could be code-split
# - Unused exports
# - Opportunities for tree-shaking
```

### Phase 2: Lambda Optimization

#### 2.1 Cold Start Optimization

**Technique 1: Lambda SnapStart (if eligible)**
```typescript
// Enable SnapStart for faster cold starts
const lambda = new NodejsFunction(this, 'OptimizedFunction', {
  // ... existing config
  snapStart: SnapStartConf.ON_PUBLISHED_VERSIONS,
});
```

**Technique 2: Reduce Bundle Size**
```typescript
// vite.config.ts optimizations
export default defineConfig({
  build: {
    target: 'es2022',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single bundle for Lambda
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
  },
  ssr: {
    noExternal: true, // Bundle everything for Lambda
    target: 'node',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Pre-bundle these
  },
});
```

**Technique 3: Optimize Dependencies**
```json
// package.json - Remove unnecessary dependencies
{
  "dependencies": {
    // Before: 150 dependencies
    // After analysis: Remove unused, use lighter alternatives
    // Example: date-fns instead of moment (67% smaller)
    "date-fns": "^2.30.0"
    // Remove: "moment": "^2.29.4"
  }
}
```

#### 2.2 Memory Right-Sizing

```typescript
// Analyze actual memory usage and right-size
// scripts/analyze-memory-usage.ts

interface MemoryRecommendation {
  application: string;
  currentMemory: number;
  averageUsed: number;
  p99Used: number;
  recommendedMemory: number;
  estimatedSavings: number;
}

async function analyzeMemoryUsage(): Promise<MemoryRecommendation[]> {
  const apps = ['internal-apps', 'supplier-portal', 'fleet-management', 'marketplace'];
  const recommendations: MemoryRecommendation[] = [];

  for (const app of apps) {
    // Fetch CloudWatch metrics for last 7 days
    const metrics = await getMemoryMetrics(app, 7);

    const averageUsed = calculateAverage(metrics);
    const p99Used = calculatePercentile(metrics, 99);

    // Recommend memory with 20% buffer above p99
    const recommendedMemory = Math.ceil(p99Used * 1.2 / 128) * 128; // Round to 128MB increments

    const currentMemory = await getCurrentMemoryConfig(app);
    const estimatedSavings = calculateCostSavings(currentMemory, recommendedMemory);

    recommendations.push({
      application: app,
      currentMemory,
      averageUsed,
      p99Used,
      recommendedMemory,
      estimatedSavings,
    });
  }

  return recommendations;
}

// Example output:
// Application: marketplace
// Current: 2048 MB
// Average used: 512 MB
// P99 used: 768 MB
// Recommended: 1024 MB (768 * 1.2 = 922, round up to 1024)
// Estimated savings: $180/month
```

#### 2.3 Provisioned Concurrency Optimization

```typescript
// Analyze traffic patterns and optimize provisioned concurrency
// Based on actual usage data

const marketplaceOptimized = new Alias(this, 'MarketplaceAlias', {
  aliasName: 'live',
  version: marketplaceFunction.currentVersion,
  provisionedConcurrentExecutions: 5, // Reduced from 10 based on data
});

// Schedule-based scaling
const scheduleRule = new Rule(this, 'BusinessHoursScale', {
  schedule: Schedule.cron({ hour: '7', minute: '0' }), // 7am AEST
});

scheduleRule.addTarget(
  new LambdaFunction(scalingFunction, {
    event: RuleTargetInput.fromObject({
      action: 'scale-up',
      alias: marketplaceOptimized.aliasArn,
      targetConcurrency: 10,
    }),
  })
);

// Scale down after business hours
const scaleDownRule = new Rule(this, 'AfterHoursScale', {
  schedule: Schedule.cron({ hour: '19', minute: '0' }), // 7pm AEST
});

scaleDownRule.addTarget(
  new LambdaFunction(scalingFunction, {
    event: RuleTargetInput.fromObject({
      action: 'scale-down',
      alias: marketplaceOptimized.aliasArn,
      targetConcurrency: 3,
    }),
  })
);
```

### Phase 3: CloudFront Optimization

#### 3.1 Cache Policy Tuning

```typescript
// Optimize cache policies based on actual hit rates
const optimizedCachePolicy = new CachePolicy(this, 'OptimizedSSRCache', {
  cachePolicyName: 'OptimizedSSR',
  minTtl: Duration.seconds(0),
  maxTtl: Duration.hours(24),
  defaultTtl: Duration.minutes(10), // Increased from 5 min based on data

  // Only cache on essential parameters
  cookieBehavior: CacheCookieBehavior.allowList(
    'session' // Only cache variations based on session
    // Removed other cookies that don't affect content
  ),

  // Reduce header variations
  headerBehavior: CacheHeaderBehavior.allowList(
    'CloudFront-Viewer-Country' // Only for geo-specific content
    // Removed Accept-Language, Accept (increases cache key space)
  ),

  // Cache all query strings but exclude tracking params
  queryStringBehavior: CacheQueryStringBehavior.allExcept(
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'fbclid',
    'gclid'
  ),

  enableAcceptEncodingGzip: true,
  enableAcceptEncodingBrotli: true,
});
```

#### 3.2 Edge Function Optimization

```typescript
// CloudFront Function to normalize URLs and improve cache hit rate
const urlNormalization = new CloudFrontFunction(this, 'URLNormalization', {
  code: CloudFrontFunctionCode.fromInline(`
    function handler(event) {
      var request = event.request;

      // Normalize query string order
      if (request.querystring) {
        var params = Object.keys(request.querystring).sort();
        var normalized = {};
        params.forEach(key => normalized[key] = request.querystring[key]);
        request.querystring = normalized;
      }

      // Remove trailing slashes
      if (request.uri.endsWith('/') && request.uri !== '/') {
        request.uri = request.uri.slice(0, -1);
      }

      // Lowercase paths for consistency
      request.uri = request.uri.toLowerCase();

      return request;
    }
  `),
  runtime: CloudFrontFunctionRuntime.JS_2_0,
});
```

### Phase 4: Bundle Optimization

#### 4.1 Code Splitting Strategy

```typescript
// Implement strategic code splitting for common patterns
// vite.config.ts

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Don't code-split for Lambda SSR
          // But optimize for client-side hydration bundle

          // Vendor chunk for large libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@autoguru/overdrive')) {
              return 'overdrive-vendor';
            }
            if (id.includes('stripe')) {
              return 'stripe-vendor';
            }
            return 'vendor';
          }

          // Route-based splitting for client
          if (id.includes('/routes/booking')) {
            return 'booking';
          }
          if (id.includes('/routes/account')) {
            return 'account';
          }
        },
      },
    },
  },
});
```

#### 4.2 Tree-Shaking Optimization

```typescript
// Ensure proper tree-shaking for lodash, date-fns, etc.
// Use named imports instead of default

// Before (entire library bundled)
import _ from 'lodash';
_.debounce(fn, 300);

// After (only debounce bundled)
import { debounce } from 'lodash-es';
debounce(fn, 300);

// Even better: use dedicated package
import debounce from 'lodash.debounce';
debounce(fn, 300);
```

#### 4.3 Remove Duplicate Dependencies

```bash
# Use yarn deduplication
yarn dedupe

# Check for duplicates
npx depcheck

# Analyze bundle for duplicates
npx duplicate-package-checker-webpack-plugin
```

### Phase 5: Image Optimization

#### 5.1 WebP Conversion

```typescript
// Convert images to WebP format with fallbacks
// vite-plugin-image-optimizer

import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      webp: {
        quality: 80,
      },
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
    }),
  ],
});
```

```tsx
// Use <picture> for WebP with fallback
<picture>
  <source srcSet="/images/hero.webp" type="image/webp" />
  <source srcSet="/images/hero.jpg" type="image/jpeg" />
  <img src="/images/hero.jpg" alt="Hero" loading="lazy" />
</picture>
```

#### 5.2 Lazy Loading

```tsx
// Implement lazy loading for below-the-fold images
import { useState, useEffect, useRef } from 'react';

export function LazyImage({ src, alt, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imgRef.current) {
            imgRef.current.src = src;
            setIsLoaded(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      alt={alt}
      className={isLoaded ? 'loaded' : 'loading'}
      {...props}
    />
  );
}
```

### Phase 6: Font Optimization

```typescript
// Optimize font loading
// app/root.tsx

export function links() {
  return [
    // Preload critical fonts
    {
      rel: 'preload',
      href: '/fonts/inter-var.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
    // Use font-display: swap
    {
      rel: 'stylesheet',
      href: '/fonts/fonts.css',
    },
  ];
}
```

```css
/* fonts.css - Use font-display: swap */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap; /* Show fallback immediately */
}
```

### Phase 7: Database Query Optimization

```typescript
// Implement DataLoader pattern for GraphQL N+1 prevention
import DataLoader from 'dataloader';

const vehicleLoader = new DataLoader(async (vehicleIds: string[]) => {
  const vehicles = await db.vehicles.findMany({
    where: { id: { in: vehicleIds } },
  });

  // Return in same order as requested
  return vehicleIds.map((id) => vehicles.find((v) => v.id === id));
});

// Use in resolvers
export async function getVehicle(id: string) {
  return vehicleLoader.load(id); // Batches requests automatically
}
```

### Phase 8: Monitoring Dashboard

```typescript
// Create consolidated performance dashboard
const performanceDashboard = new Dashboard(this, 'RR7PerformanceDashboard', {
  dashboardName: 'ReactRouter7-Platform-Performance',
  widgets: [
    [
      new SingleValueWidget({
        title: 'Platform-wide Error Rate',
        metrics: [
          new MathExpression({
            expression: 'SUM([m1, m2, m3, m4]) / SUM([i1, i2, i3, i4]) * 100',
            usingMetrics: {
              m1: internalApps.metricErrors(),
              m2: supplierPortal.metricErrors(),
              m3: fleetManagement.metricErrors(),
              m4: marketplace.metricErrors(),
              i1: internalApps.metricInvocations(),
              i2: supplierPortal.metricInvocations(),
              i3: fleetManagement.metricInvocations(),
              i4: marketplace.metricInvocations(),
            },
          }),
        ],
      }),
      new SingleValueWidget({
        title: 'Total Monthly Cost',
        metrics: [
          new Metric({
            namespace: 'AWS/Billing',
            metricName: 'EstimatedCharges',
            statistic: 'Maximum',
            period: Duration.days(1),
            dimensionsMap: {
              ServiceName: 'AWSLambda',
            },
          }),
        ],
      }),
    ],
    [
      new GraphWidget({
        title: 'Cold Starts by Application',
        left: [
          new Metric({
            namespace: 'AWS/Lambda',
            metricName: 'Duration',
            statistic: 'Maximum',
            dimensionsMap: { FunctionName: 'marketplace' },
          }),
          // ... other apps
        ],
      }),
      new GraphWidget({
        title: 'Memory Utilization',
        left: [
          new MathExpression({
            expression: 'used / allocated * 100',
            usingMetrics: {
              used: new Metric({
                namespace: 'AWS/Lambda',
                metricName: 'MemoryUsed',
                statistic: 'Average',
              }),
              allocated: new Metric({
                namespace: 'AWS/Lambda',
                metricName: 'MemorySize',
                statistic: 'Average',
              }),
            },
          }),
        ],
      }),
    ],
    [
      new GraphWidget({
        title: 'CloudFront Cache Hit Rate',
        left: [
          internalDistribution.metricCacheHitRate(),
          supplierDistribution.metricCacheHitRate(),
          fleetDistribution.metricCacheHitRate(),
          marketplaceDistribution.metricCacheHitRate(),
        ],
      }),
      new GraphWidget({
        title: 'Cost Trend (30 days)',
        left: [
          new Metric({
            namespace: 'AWS/Billing',
            metricName: 'EstimatedCharges',
            statistic: 'Maximum',
            period: Duration.days(1),
          }),
        ],
      }),
    ],
  ],
});
```

## Acceptance Criteria Summary

### Performance Targets

| Application | Metric | Before | Target | Achieved |
|-------------|--------|--------|--------|----------|
| Internal Apps | Cold Start (p95) | 2.5s | 2.0s | ___ |
| Internal Apps | Duration (p95) | 450ms | 350ms | ___ |
| Supplier Portal | Cold Start (p95) | 2.8s | 2.2s | ___ |
| Supplier Portal | Duration (p95) | 500ms | 400ms | ___ |
| Fleet Management | Cold Start (p95) | 3.0s | 2.4s | ___ |
| Fleet Management | Duration (p95) | 400ms | 320ms | ___ |
| Marketplace | Cold Start (p95) | 2.0s | 1.5s | ___ |
| Marketplace | Duration (p95) | 250ms | 200ms | ___ |

### Cost Targets

| Resource | Current | Target | Achieved |
|----------|---------|--------|----------|
| Lambda (all apps) | $2,400/mo | $1,900/mo | ___ |
| CloudFront | $800/mo | $700/mo | ___ |
| S3 | $200/mo | $150/mo | ___ |
| Total | $3,400/mo | $2,750/mo | ___ |

**Target Savings**: $650/month ($7,800/year)

### Quality Targets

| Metric | Target | Achieved |
|--------|--------|----------|
| Platform Error Rate | < 0.01% | ___ |
| CloudFront Cache Hit Rate | > 85% | ___ |
| Lighthouse Score (Marketplace) | 95+ | ___ |
| Bundle Size Reduction | 15%+ | ___ |

## Definition of Done

### Analysis Complete
- [ ] Lambda performance analysis completed
- [ ] Cost analysis completed
- [ ] Bundle analysis completed
- [ ] Database query analysis completed
- [ ] Optimization recommendations documented

### Optimizations Implemented
- [ ] Lambda memory right-sized for all apps
- [ ] Cold start optimizations implemented
- [ ] Provisioned concurrency optimized
- [ ] CloudFront cache policies optimized
- [ ] Bundle sizes reduced by 15%+
- [ ] Image optimization implemented
- [ ] Font loading optimized
- [ ] Database queries optimized
- [ ] Error handling improved
- [ ] Retry logic implemented

### Monitoring & Documentation
- [ ] Consolidated performance dashboard created
- [ ] Cost dashboard created
- [ ] Performance budgets defined
- [ ] Optimization playbook documented
- [ ] Before/after metrics documented
- [ ] Cost savings validated

### Validation Complete
- [ ] Performance targets met
- [ ] Cost targets met
- [ ] Quality targets met
- [ ] No performance regressions
- [ ] Load testing passed with optimizations
- [ ] Team reviewed and approved

## Dependencies

### Blocked By
- AG-TBD-025: Marketplace migration (need production data from all apps)

### Blocks
- AG-TBD-028: Webpack deprecation (optimizations inform deprecation plan)

### Related Stories
- AG-TBD-027: Documentation (optimization playbook)

## Story Points Justification

**Complexity Factors**:

- **Analysis Work**: Medium
  - Collect and analyze data from 4 applications
  - Identify patterns and optimization opportunities
  - Estimated: 2 days

- **Implementation**: Medium-High
  - Lambda optimizations across 4 apps
  - CloudFront tuning
  - Bundle optimization
  - Image and font optimization
  - Database query optimization
  - Estimated: 4-5 days

- **Testing & Validation**: Medium
  - Validate performance improvements
  - Cost validation
  - Regression testing
  - Estimated: 2 days

- **Documentation**: Low-Medium
  - Document optimizations
  - Create playbook
  - Estimated: 1 day

**Total Points**: 8

**Breakdown**:
- Analysis: 2 points
- Implementation: 4 points
- Testing: 1 point
- Documentation: 1 point

## Notes & Decisions

### Technical Decisions

- **Lambda Memory Right-Sizing**: Use p99 memory usage + 20% buffer
  - Rationale: Balances performance with cost, prevents out-of-memory errors

- **Provisioned Concurrency Scheduling**: Schedule-based scaling for business hours
  - Rationale: Traffic patterns predictable, significant cost savings vs 24/7

- **CloudFront Cache Policy**: Increase TTL, reduce cache key variations
  - Rationale: Cache hit rate analysis shows opportunities for longer caching

- **Bundle Optimization**: Focus on marketplace first (largest impact)
  - Rationale: Marketplace serves most traffic, highest ROI

### Open Questions
- [ ] Should we use Lambda SnapStart? (Recommend test in staging first)
- [ ] What's the optimal provisioned concurrency schedule? (Recommend analyze traffic patterns first)
- [ ] Should we implement edge caching for static content? (Recommend yes, S3 origin for assets)

### Assumptions
- Production traffic patterns remain similar to migration period
- Cost optimizations don't negatively impact performance
- Right-sizing recommendations accurate based on 7 days data
- Bundle optimization techniques don't break applications

### Success Criteria

Optimization is successful if:
- ✓ Performance targets met or exceeded
- ✓ Cost savings of $650+/month achieved
- ✓ Zero performance regressions
- ✓ CloudFront cache hit rate > 85%
- ✓ Lighthouse scores improved by 5+ points
- ✓ Bundle sizes reduced by 15%+
- ✓ No customer complaints about performance
