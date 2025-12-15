# Story: PM. Build Tooling. As a Platform Engineer, I want to migrate remaining high-traffic SPAs to Vite builds, so that we can complete the SPA migration and deliver benefits to our most critical applications

## Story Details

**Story ID**: AG-TBD-013
**Epic**: AG-TBD - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Should Have
**Story Points**: 13
**Sprint**: 6

## Description

### Summary

This is the final phase of our SPA migration to Vite builds, covering the remaining high-traffic applications including critical booking flows, marketplace components, and core portal functionality. These are our most important SPAs - the ones that directly drive revenue, serve thousands of daily users, and cannot afford any downtime or degradation.

After successfully migrating 15 SPAs in phases 1 and 2, we're now ready to tackle the highest-stakes applications with full confidence in our process, comprehensive playbook, and proven track record. This phase requires the most rigorous testing, stakeholder coordination, and monitoring of any phase.

Success here means 100% of our SPA estate is on Vite builds, delivering significant business value through faster deployments, reduced CI/CD costs, and improved developer productivity across all our platforms.

### Background

Phases 1 and 2 have validated the migration process across 15 diverse SPAs, from internal tools to customer-facing features. We've refined our playbook, built extensive tooling, and established efficient coordination patterns with teams. Now we're applying all these learnings to our most critical applications.

High-traffic SPAs are the backbone of our business - they handle the core booking flows for B2C marketplace, supplier job management, and fleet operations. These apps serve 5,000-20,000+ daily active users and generate the majority of our platform revenue. Any issues here have immediate business impact.

### User Value

Platform engineers will complete the SPA migration journey, proving the process works even for the most demanding applications. Developers working on critical features will benefit from dramatically faster build times, enabling quicker iterations and faster time-to-production. Most importantly, customers will indirectly benefit from our ability to ship improvements and fixes faster, while the business realizes full CI/CD cost savings and improved operational efficiency.

## User Persona

**Role**: Platform Engineer
**Name**: "Alex the Platform Engineer"
**Context**: Final phase of SPA migration, highest-stakes deployments
**Goals**: Zero regressions on critical apps, flawless execution, business value delivery
**Pain Points**: High pressure, maximum scrutiny, zero tolerance for errors, stakeholder anxiety

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | All remaining high-traffic SPAs identified and prioritized by business criticality | ☐ | ☐ | ☐ |
| 2 | Each SPA builds successfully with Vite across all environments (dev, test, uat, preprod, prod, dockerprod, shared) | ☐ | ☐ | ☐ |
| 3 | Build manifests validated identical to webpack outputs for each SPA | ☐ | ☐ | ☐ |
| 4 | Booking flows complete successfully end-to-end (B2C, supplier, fleet) | ☐ | ☐ | ☐ |
| 5 | Payment integrations work correctly for all booking SPAs | ☐ | ☐ | ☐ |
| 6 | Multi-tenant functionality validated for all tenants (au, nz, global) | ☐ | ☐ | ☐ |
| 7 | All existing unit tests pass for each SPA (100% coverage) | ☐ | ☐ | ☐ |
| 8 | All existing integration tests pass for each SPA | ☐ | ☐ | ☐ |
| 9 | All existing E2E tests pass for each SPA (100% passing) | ☐ | ☐ | ☐ |
| 10 | Production deployments successful with zero critical incidents | ☐ | ☐ | ☐ |
| 11 | Business metrics maintained (conversion rates, booking completions) | ☐ | ☐ | ☐ |
| 12 | No customer-reported issues during 2 week monitoring period | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Build time improved by at least 50% for each SPA | ☐ | ☐ | ☐ |
| 2 | Bundle sizes remain same or smaller (no degradation) | ☐ | ☐ | ☐ |
| 3 | Page load performance improved or maintained (p50, p95, p99) | ☐ | ☐ | ☐ |
| 4 | Time to interactive maintained or improved | ☐ | ☐ | ☐ |
| 5 | Zero accessibility regressions (WCAG AA maintained) | ☐ | ☐ | ☐ |
| 6 | Error rates remain below 0.05% of sessions | ☐ | ☐ | ☐ |
| 7 | Apdex score maintained or improved for all SPAs | ☐ | ☐ | ☐ |
| 8 | Conversion funnels maintain >98% of baseline rates | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Complex booking flows with multiple steps work correctly | ☐ | ☐ | ☐ |
| 2 | Payment provider integrations maintain 100% success rate | ☐ | ☐ | ☐ |
| 3 | Quote calculation engines produce identical results | ☐ | ☐ | ☐ |
| 4 | Real-time availability checking works correctly | ☐ | ☐ | ☐ |
| 5 | Analytics and conversion tracking maintain accuracy | ☐ | ☐ | ☐ |
| 6 | A/B test framework continues functioning correctly | ☐ | ☐ | ☐ |
| 7 | Peak traffic loads handled without degradation | ☐ | ☐ | ☐ |

## Technical Implementation

### High-Traffic SPA Selection

**Critical Business SPAs** (Remaining high-traffic apps):

#### B2C Marketplace - Booking Flow (Highest Priority)
1. **mg-booking** (My Garage Booking)
   - Type: SPA, Consumer booking
   - Traffic: Very High (5,000-10,000 DAU)
   - Criticality: Critical (primary revenue driver)
   - Complexity: Very High (multi-step booking, payments, quotes)
   - Business Impact: High revenue, high visibility

2. **cb-portal** (Customer Booking Portal)
   - Type: SPA, Customer booking management
   - Traffic: High (3,000-5,000 DAU)
   - Criticality: Critical (booking management)
   - Complexity: High (booking history, modifications, cancellations)
   - Business Impact: High customer satisfaction impact

#### Supplier Portal - Job Management (Critical)
3. **sp-booking** (Supplier Portal Booking)
   - Type: SPA, Supplier job management
   - Traffic: Very High (8,000-15,000 DAU)
   - Criticality: Critical (supplier operations)
   - Complexity: Very High (job acceptance, pricing, scheduling)
   - Business Impact: Core supplier workflow

4. **sp-job** (Supplier Portal Jobs)
   - Type: SPA, Job listing and management
   - Traffic: Very High (10,000-20,000 DAU)
   - Criticality: Critical (job pipeline)
   - Complexity: High (filtering, sorting, bulk operations)
   - Business Impact: Primary supplier interface

5. **sp-dashboard** (Supplier Dashboard)
   - Type: SPA, Supplier analytics and overview
   - Traffic: High (5,000-8,000 DAU)
   - Criticality: High (business intelligence)
   - Complexity: Medium-High (charts, metrics, real-time data)
   - Business Impact: Supplier engagement

#### Fleet Portal - Booking & Operations (Critical)
6. **fcp-booking** (Fleet Client Portal Booking)
   - Type: SPA, Fleet booking
   - Traffic: High (2,000-4,000 DAU)
   - Criticality: Critical (fleet booking flow)
   - Complexity: Very High (multi-vehicle, approval workflows)
   - Business Impact: High-value enterprise customers

7. **fmo-booking** (Fleet Portal Booking)
   - Type: SPA, Fleet management booking
   - Traffic: High (2,500-5,000 DAU)
   - Criticality: Critical (fleet operations)
   - Complexity: Very High (portfolio management, bulk operations)
   - Business Impact: Enterprise revenue

#### App Shells (Critical Infrastructure)
8. **sp-app-shell** (Supplier Portal App Shell)
   - Type: SPA, Shell container
   - Traffic: Very High (all supplier users)
   - Criticality: Critical (loads all supplier MFEs)
   - Complexity: High (MFE orchestration)
   - Business Impact: Platform availability

9. **fcp-app-shell** (Fleet Client Portal App Shell)
   - Type: SPA, Shell container
   - Traffic: High (all fleet client users)
   - Criticality: Critical (loads all fleet MFEs)
   - Complexity: High (MFE orchestration)
   - Business Impact: Platform availability

10. **fmo-app-shell** (Fleet Portal App Shell)
    - Type: SPA, Shell container
    - Traffic: High (all fleet management users)
    - Criticality: Critical (loads all fleet ops MFEs)
    - Complexity: High (MFE orchestration)
    - Business Impact: Platform availability

**Selection Rationale**:
- These are the final remaining SPAs with high traffic/criticality
- Include all critical booking flows across platforms
- Include all app shells (critical infrastructure)
- Collectively serve 50,000+ daily active users
- Generate majority of platform revenue
- Cannot afford any downtime or degradation

### Migration Strategy: Phased Rollout with Canary Deployments

Given the criticality, we'll use a more conservative approach:

#### Week 1: App Shells (Foundation)
**Rationale**: App shells must work perfectly as they load all other MFEs

- **Days 1-2**: sp-app-shell
  - Most critical (highest traffic)
  - Canary deployment: 10% → 50% → 100%
  - Extended monitoring at each stage

- **Days 3-4**: fcp-app-shell
  - Second most critical
  - Apply learnings from sp-app-shell
  - Canary deployment approach

- **Day 5**: fmo-app-shell
  - Benefit from previous shell migrations
  - Standard canary deployment

#### Week 2: Supplier Booking Flow
**Rationale**: Highest traffic apps, core supplier workflow

- **Days 1-2**: sp-dashboard
  - Dashboard first (lower risk than booking)
  - Validate data visualization and real-time updates

- **Days 3-4**: sp-job
  - Highest traffic SPA
  - Critical job pipeline
  - Extended canary period

- **Day 5**: sp-booking
  - Core booking acceptance flow
  - Maximum scrutiny and testing

#### Week 3: Consumer & Fleet Booking
**Rationale**: Revenue-generating booking flows

- **Days 1-2**: cb-portal
  - Customer booking management
  - Lower traffic than mg-booking

- **Days 3-4**: fcp-booking
  - Fleet client booking
  - Enterprise customers (careful coordination)

- **Days 4-5**: fmo-booking
  - Fleet management booking
  - Complex approval workflows

- **Day 5**: mg-booking
  - **Highest risk migration**
  - Primary B2C revenue driver
  - Most extensive testing and monitoring
  - Consider weekend deployment

### Canary Deployment Implementation

```typescript
// Canary deployment configuration
interface CanaryConfig {
  app: string;
  stages: CanaryStage[];
  rollbackTriggers: RollbackTrigger[];
  monitoring: MonitoringConfig;
}

interface CanaryStage {
  percentage: number;
  duration: string; // e.g., "2 hours", "24 hours"
  successCriteria: SuccessCriteria;
  automaticPromotion: boolean;
}

const HIGH_TRAFFIC_CANARY: CanaryConfig = {
  app: 'sp-booking',
  stages: [
    {
      percentage: 10,
      duration: '4 hours',
      successCriteria: {
        errorRate: '<0.05%',
        performanceDegradation: '<5%',
        conversionRate: '>98% baseline',
      },
      automaticPromotion: false, // Manual approval required
    },
    {
      percentage: 50,
      duration: '12 hours',
      successCriteria: {
        errorRate: '<0.05%',
        performanceDegradation: '<5%',
        conversionRate: '>99% baseline',
      },
      automaticPromotion: false,
    },
    {
      percentage: 100,
      duration: 'indefinite',
      successCriteria: {
        errorRate: '<0.05%',
        performanceDegradation: '0%',
        conversionRate: '>=100% baseline',
      },
      automaticPromotion: false,
    },
  ],
  rollbackTriggers: {
    errorRate: '>0.1%',
    performanceDegradation: '>10%',
    conversionDrop: '>2%',
    criticalError: true,
  },
  monitoring: {
    interval: '1 minute',
    dashboards: ['new-relic', 'business-metrics'],
    alerts: ['pagerduty', '#platform-engineering', '#supplier-portal'],
  },
};
```

### Enhanced Testing Protocol

#### Pre-Migration Testing (Extra Rigorous)

```typescript
// Comprehensive pre-migration validation
interface PreMigrationValidation {
  app: string;
  checks: {
    buildComparison: BuildComparisonResult;
    functionalTesting: FunctionalTestResult;
    performanceTesting: PerformanceTestResult;
    businessLogicValidation: BusinessLogicResult;
    integrationTesting: IntegrationTestResult;
  };
  approved: boolean;
  approvers: string[];
}

const runPreMigrationValidation = async (app: string) => {
  // 1. Build Output Comparison (byte-by-byte)
  const buildComparison = await compareBuildOutputs(app);
  assert(buildComparison.identical, 'Build outputs must be identical');

  // 2. Functional Testing (100% coverage)
  const functionalTests = await runFullTestSuite(app);
  assert(functionalTests.passRate === 1.0, 'All tests must pass');

  // 3. Performance Testing (comprehensive)
  const perfTests = await runPerformanceSuite(app);
  assert(perfTests.regressions.length === 0, 'No performance regressions');

  // 4. Business Logic Validation (critical flows)
  const businessTests = await validateBusinessLogic(app);
  assert(businessTests.criticalFlowsPass === true, 'Critical flows must work');

  // 5. Integration Testing (all dependencies)
  const integrationTests = await runIntegrationSuite(app);
  assert(integrationTests.allPassing === true, 'All integrations must work');

  return {
    app,
    validated: true,
    timestamp: new Date(),
    approvers: ['platform-lead', 'qa-lead', 'product-owner'],
  };
};
```

#### Critical Flow Testing

```typescript
// Critical booking flow validation
describe('Critical Booking Flow - mg-booking (Vite)', () => {
  beforeEach(async () => {
    // Set up test environment
    await setupTestUser();
    await setupTestVehicle();
    await setupTestSuppliers();
  });

  describe('Complete Booking Journey', () => {
    it('completes full booking flow without errors', async () => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      // Step 1: Landing page
      await page.goto('/my-garage/booking');
      await expect(page.locator('[data-testid="booking-start"]')).toBeVisible();

      // Step 2: Select service
      await page.click('[data-testid="service-type-general"]');
      await page.click('[data-testid="continue-to-details"]');

      // Step 3: Enter details
      await page.fill('[data-testid="booking-details"]', 'Test booking details');
      await page.click('[data-testid="continue-to-quote"]');

      // Step 4: Get quotes
      await page.waitForSelector('[data-testid="quote-results"]');
      const quoteCount = await page.locator('[data-testid="quote-card"]').count();
      expect(quoteCount).toBeGreaterThan(0);

      // Step 5: Select supplier
      await page.click('[data-testid="quote-card"]:first-child [data-testid="select-quote"]');

      // Step 6: Select time slot
      await page.click('[data-testid="time-slot"]:first-child');
      await page.click('[data-testid="continue-to-payment"]');

      // Step 7: Enter payment details
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');

      // Step 8: Complete booking
      await page.click('[data-testid="complete-booking"]');

      // Verify success
      await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
      await expect(page.locator('[data-testid="booking-reference"]')).toContainText(/BKG-\d+/);

      // Verify no JavaScript errors
      expect(errors).toHaveLength(0);
    });

    it('maintains quote calculation accuracy', async () => {
      // Capture baseline quote calculations with webpack
      const webpackQuotes = await getQuotesWithWebpack();

      // Get quotes with Vite
      const viteQuotes = await getQuotesWithVite();

      // Compare results (must be identical)
      expect(viteQuotes.length).toBe(webpackQuotes.length);

      for (let i = 0; i < viteQuotes.length; i++) {
        expect(viteQuotes[i].price).toBe(webpackQuotes[i].price);
        expect(viteQuotes[i].supplierId).toBe(webpackQuotes[i].supplierId);
        expect(viteQuotes[i].availability).toBe(webpackQuotes[i].availability);
      }
    });

    it('handles payment processing correctly', async () => {
      // Complete booking flow to payment
      await completeBookingToPayment();

      // Process payment
      const paymentResult = await processTestPayment();

      expect(paymentResult.status).toBe('success');
      expect(paymentResult.bookingCreated).toBe(true);
      expect(paymentResult.emailSent).toBe(true);
      expect(paymentResult.supplierNotified).toBe(true);
    });

    it('tracks analytics events correctly', async () => {
      const analyticsEvents = [];

      // Capture analytics events
      page.on('request', request => {
        if (request.url().includes('analytics')) {
          analyticsEvents.push(JSON.parse(request.postData()));
        }
      });

      // Complete booking flow
      await completeFullBookingFlow();

      // Verify expected events fired
      expect(analyticsEvents).toContainEqual(
        expect.objectContaining({ event: 'booking_started' })
      );
      expect(analyticsEvents).toContainEqual(
        expect.objectContaining({ event: 'quote_requested' })
      );
      expect(analyticsEvents).toContainEqual(
        expect.objectContaining({ event: 'quote_selected' })
      );
      expect(analyticsEvents).toContainEqual(
        expect.objectContaining({ event: 'booking_completed' })
      );
    });
  });

  describe('Performance Requirements', () => {
    it('meets time-to-interactive targets', async () => {
      const metrics = await page.metrics();

      expect(metrics.TaskDuration).toBeLessThan(3000); // 3 seconds TTI
    });

    it('loads quotes within acceptable time', async () => {
      await page.goto('/my-garage/booking');
      await fillBookingDetails();

      const start = Date.now();
      await page.click('[data-testid="get-quotes"]');
      await page.waitForSelector('[data-testid="quote-results"]');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000); // 2 seconds max
    });
  });

  describe('Business Metric Validation', () => {
    it('maintains conversion funnel completion rates', async () => {
      // Run 100 test bookings
      const results = await runBookingTests(100);

      const conversionRate = results.completed / results.started;

      expect(conversionRate).toBeGreaterThan(0.98); // >98% baseline
    });
  });
});
```

### Business Metrics Monitoring

```typescript
// Real-time business metrics monitoring
interface BusinessMetrics {
  app: string;
  period: string;
  metrics: {
    // Booking Apps
    bookingStarted: number;
    bookingCompleted: number;
    conversionRate: number;
    averageOrderValue: number;
    revenueGenerated: number;

    // Supplier Apps
    jobsAccepted: number;
    jobsCompleted: number;
    supplierResponseTime: number;
    supplierSatisfaction: number;

    // General
    activeUsers: number;
    sessionDuration: number;
    pageViews: number;
    bounceRate: number;
  };
  baseline: BusinessMetrics['metrics'];
  deltas: {
    [K in keyof BusinessMetrics['metrics']]: {
      absolute: number;
      percentage: number;
      acceptable: boolean;
    };
  };
}

const monitorBusinessMetrics = async (app: string) => {
  const current = await fetchCurrentMetrics(app);
  const baseline = await fetchBaselineMetrics(app);

  const deltas = calculateDeltas(current, baseline);

  // Alert if any critical metric degrades
  for (const [metric, delta] of Object.entries(deltas)) {
    if (!delta.acceptable) {
      await alertTeam({
        severity: 'critical',
        app,
        metric,
        delta,
        message: `Business metric degradation detected: ${metric} is ${delta.percentage}% ${delta.absolute > 0 ? 'above' : 'below'} baseline`,
      });

      // Trigger automatic rollback if conversion rate drops significantly
      if (metric === 'conversionRate' && delta.percentage < -5) {
        await initiateEmergencyRollback(app, 'Conversion rate dropped >5%');
      }
    }
  }

  return { current, baseline, deltas };
};
```

### Stakeholder Coordination

#### Executive Summary Template

```markdown
## High-Traffic SPA Migration - Executive Summary

**Purpose**: Complete migration of critical business applications to Vite builds
**Timeline**: Sprint 6 (3 weeks)
**Business Impact**: Minimal risk, significant long-term benefits

### Applications in Scope

**Critical Booking Flows**:
- mg-booking: Primary B2C booking (10,000+ DAU)
- sp-booking: Supplier job acceptance (15,000+ DAU)
- fcp-booking: Fleet client booking (4,000+ DAU)
- fmo-booking: Fleet management booking (5,000+ DAU)
- cb-portal: Customer booking portal (5,000+ DAU)

**Core Infrastructure**:
- sp-app-shell: Supplier portal shell (all supplier users)
- fcp-app-shell: Fleet client shell (all fleet users)
- fmo-app-shell: Fleet management shell (all fleet ops)

**Business Intelligence**:
- sp-dashboard: Supplier analytics (8,000+ DAU)
- sp-job: Job listing (20,000+ DAU)

### Risk Mitigation

**Technical Safeguards**:
✅ Canary deployments (10% → 50% → 100%)
✅ Real-time business metrics monitoring
✅ Instant rollback capability (<5 minutes)
✅ Comprehensive testing (15 SPAs already successful)
✅ 24/7 monitoring during migration period

**Business Safeguards**:
✅ Zero tolerance for revenue impact
✅ Conversion funnel monitoring
✅ Customer experience tracking
✅ Supplier satisfaction monitoring
✅ Extended validation periods

**Success Track Record**:
✅ 15 SPAs already migrated successfully
✅ Zero production incidents
✅ 60% average build time improvement
✅ Zero functionality regressions
✅ Positive team feedback

### Expected Benefits

**Engineering Efficiency**:
- 50-70% faster build times
- 45% reduction in CI/CD time
- Faster deployment cycles

**Business Value**:
- Faster time-to-market for features
- Quicker bug fix deployments
- Reduced infrastructure costs (~$300/month savings)
- Improved developer productivity

**Risk Level**: Low
- Proven technology and process
- Extensive testing and validation
- Conservative rollout approach
- Instant rollback capability

### Timeline

**Week 1**: App shells (foundation for all other MFEs)
**Week 2**: Supplier booking flow (highest traffic)
**Week 3**: Consumer and fleet booking flows

### Approval Required

- [ ] Engineering Manager approval
- [ ] Product Owner approval (for each platform)
- [ ] Executive stakeholder notification

### Communication

Weekly status updates to leadership
Real-time alerts for any issues
Post-migration success report
```

## Testing Requirements

### Comprehensive Test Plan

| SPA | Unit | Integration | E2E | Manual | Performance | Load | Business Metrics | UAT |
|-----|------|-------------|-----|--------|-------------|------|------------------|-----|
| sp-app-shell | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fcp-app-shell | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fmo-app-shell | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| sp-dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| sp-job | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| sp-booking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| cb-portal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fcp-booking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fmo-booking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| mg-booking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

✅ = Full testing required
⚠️ = Basic load testing (dashboard not booking flow)

### Load Testing Requirements

```typescript
// Load testing for high-traffic apps
import { check, group } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests under 2s
    'http_req_failed': ['rate<0.01'],    // Error rate under 1%
  },
};

export default function () {
  group('Booking Flow Load Test', () => {
    // Step 1: Load booking page
    let res = http.get('https://autoguru.com.au/my-garage/booking');
    check(res, { 'booking page loaded': (r) => r.status === 200 });

    // Step 2: Request quotes
    res = http.post('https://api.autoguru.com.au/graphql', {
      query: '{ quotes(input: {...}) }',
    });
    check(res, { 'quotes returned': (r) => r.status === 200 });

    // Step 3: Select quote and book
    // ... additional steps
  });
}
```

## Communication Plan

### Pre-Migration Executive Briefing

```
To: Engineering Leadership, Product Leadership
Subject: Critical SPA Migration - Final Phase Commencing [Date]

Executive Summary:

We're entering the final phase of our SPA migration to Vite builds, covering our 10 most critical applications including all major booking flows and app shells.

**What's Happening**:
- Migrating final 10 high-traffic SPAs to modern build system
- Includes all booking flows (B2C, supplier, fleet)
- Conservative 3-week rollout with canary deployments
- 24/7 monitoring and instant rollback capability

**Why It Matters**:
- Completes $50K infrastructure modernization initiative
- Delivers 50-70% build time improvements for critical apps
- Enables faster feature delivery and bug fixes
- Reduces CI/CD costs by ~$300/month

**Risk Mitigation**:
✅ 15 SPAs already successfully migrated (zero incidents)
✅ Canary deployment approach (10% → 50% → 100%)
✅ Real-time business metrics monitoring
✅ Instant rollback (<5 minutes)
✅ Extended validation periods (2 weeks per app)

**Your Involvement**:
- Stay informed via weekly status updates
- Approve go-live for each critical app
- Escalation contact for business impact decisions

**Timeline**:
- Week 1: App shells (Mar 3-7)
- Week 2: Supplier flows (Mar 10-14)
- Week 3: B2C/Fleet flows (Mar 17-21)

Questions or concerns? Let's discuss.

[Platform Team Lead]
```

### Daily Updates During Critical Migrations

```
#exec-updates (Slack)

🚀 Critical SPA Migration - Day [X] Update

**Today's Milestone**: mg-booking (Primary B2C Booking)

**Status**:
- ✅ Canary 10%: Deployed 2 hours ago, monitoring healthy
- 🟡 Canary 50%: Awaiting approval (all metrics green)
- ⏸️ Canary 100%: Scheduled pending 50% validation

**Metrics** (10% canary):
- Error rate: 0.02% (baseline: 0.03%) ✅
- Page load (p95): 1.8s (baseline: 2.1s) ✅ +14% faster
- Conversion rate: 24.5% (baseline: 24.3%) ✅
- Revenue: $15,200 (2hr period, normal range) ✅
- User feedback: 0 issues reported ✅

**Next Steps**:
- Promote to 50% canary at 2pm (pending approval)
- Monitor 50% for 12 hours
- Full rollout tomorrow if all green

**Other Apps Today**:
- cb-portal: Fully deployed, monitoring for 12 hours
- fmo-booking: In dev testing

Blocking issues: None
Risk level: Low

[Platform Team]
```

## Rollback Plan

### Enhanced Rollback Procedures

```typescript
// Automatic rollback for critical apps
interface CriticalAppRollback {
  app: string;
  triggers: AutomaticRollbackTrigger[];
  procedure: RollbackProcedure;
  notification: NotificationConfig;
}

const CRITICAL_APP_ROLLBACK: CriticalAppRollback = {
  app: 'mg-booking',
  triggers: [
    {
      metric: 'errorRate',
      threshold: 0.001, // 0.1%
      duration: '5 minutes',
      action: 'immediate_rollback',
    },
    {
      metric: 'conversionRate',
      threshold: -0.03, // -3% from baseline
      duration: '15 minutes',
      action: 'immediate_rollback',
    },
    {
      metric: 'revenuePerMinute',
      threshold: -0.10, // -10% from baseline
      duration: '10 minutes',
      action: 'immediate_rollback',
    },
    {
      metric: 'criticalError',
      threshold: 1, // Any critical error
      duration: 'immediate',
      action: 'emergency_rollback',
    },
  ],
  procedure: {
    step1: 'Stop canary promotion',
    step2: 'Route all traffic to webpack build',
    step3: 'Notify all stakeholders',
    step4: 'Create incident report',
    step5: 'Schedule post-mortem',
  },
  notification: {
    immediate: ['pagerduty', 'platform-lead', 'engineering-manager'],
    within_5min: ['#platform-engineering', '#exec-updates'],
    within_15min: ['product-owners', 'qa-lead'],
  },
};
```

### Rollback Communication Templates

```
IMMEDIATE ROLLBACK NOTIFICATION

To: Engineering Leadership, Platform Team, Product Owners
Subject: [URGENT] Rollback Initiated - [APP-NAME]
Priority: P0

An automatic rollback has been initiated for [APP-NAME] due to [TRIGGER].

**Details**:
- Time: [timestamp]
- Trigger: [metric] exceeded threshold
- Metric value: [value]
- Baseline: [baseline]
- Canary percentage: [X%]

**Actions Taken**:
✅ Traffic routed to webpack build
✅ Monitoring confirmed rollback successful
✅ Incident created: [INC-XXXX]

**Current Status**:
- All traffic on stable webpack build
- No user impact
- Root cause investigation in progress

**Next Steps**:
- Root cause analysis: [Lead Engineer]
- Post-mortem: [Time]
- Remediation plan: TBD

Point of contact: [Platform Lead] [Phone]
```

## Definition of Done

### Development Complete
- [ ] All 10 high-traffic SPAs migrated to Vite
- [ ] Canary deployments successful for each SPA
- [ ] Build comparisons validated (byte-level identical)
- [ ] All critical flows tested and validated
- [ ] Performance benchmarks met or exceeded

### Testing Complete
- [ ] 100% unit test pass rate for all SPAs
- [ ] 100% integration test pass rate
- [ ] 100% E2E test pass rate
- [ ] Load testing completed for all booking flows
- [ ] Business logic validation completed
- [ ] Payment integration testing completed
- [ ] Analytics/tracking validation completed
- [ ] Cross-browser testing completed
- [ ] Mobile testing completed
- [ ] Accessibility testing completed (WCAG AA)

### Deployment Complete
- [ ] All 10 SPAs deployed through all environments
- [ ] Canary progressions completed (10% → 50% → 100%)
- [ ] All app shells working correctly
- [ ] All booking flows functional
- [ ] Multi-tenant deployments validated

### Monitoring Complete
- [ ] 2 weeks minimum monitoring per app
- [ ] Zero critical incidents
- [ ] Business metrics maintained (conversion, revenue)
- [ ] User satisfaction maintained (NPS/Apdex)
- [ ] Error rates within acceptable limits
- [ ] Performance metrics meeting targets

### Business Validation Complete
- [ ] Conversion funnels maintaining >98% baseline
- [ ] Revenue impact neutral or positive
- [ ] Customer feedback neutral or positive
- [ ] Supplier satisfaction maintained
- [ ] No increase in support tickets

### Documentation Complete
- [ ] Migration tracking updated for all apps
- [ ] Learnings documented and shared
- [ ] Playbook finalized with all edge cases
- [ ] Executive summary report created
- [ ] Success metrics report published
- [ ] Team retrospective completed

### Communication Complete
- [ ] All stakeholders notified of completion
- [ ] Engineering all-hands presentation delivered
- [ ] Executive summary shared with leadership
- [ ] Blog post published (internal)
- [ ] Knowledge base updated

## Dependencies

### Blocked By
- AG-TBD-012: Migrate medium-traffic SPAs (must complete successfully)
- AG-TBD-011: Migrate low-traffic SPAs (must complete successfully)
- AG-TBD-011a: MFE migration playbook (must be comprehensive)

### Blocks
- AG-TBD-027: Documentation and training (final migration docs)
- AG-TBD-028: Webpack deprecation plan (can begin deprecation after this)

### Related Stories
- All previous Vite migration stories (foundation for this work)

## Story Points Justification

**Complexity Factors**:
- **Critical Business Impact**: Very High
  - Highest-traffic apps (50,000+ total DAU)
  - Revenue-generating booking flows
  - Cannot afford any issues
  - Executive visibility

- **Technical Complexity**: High
  - Complex booking flows
  - Payment integrations
  - App shell orchestration
  - Real-time availability systems

- **Testing Requirements**: Very High
  - 100% test coverage required
  - Load testing required
  - Business metrics validation
  - Extended monitoring periods

- **Stakeholder Coordination**: Very High
  - Executive approvals needed
  - Product owner coordination
  - Customer communication preparation
  - 24/7 on-call coverage

**Time Estimate**:
- Pre-migration prep: 1 week
- Migration execution: 3 weeks (conservative, canary deployments)
- Extended monitoring: 2 weeks (overlaps with next sprint)
- Documentation: 2 days
- **Total**: 3 weeks primary work + extended monitoring

**Total Points**: 13

## Notes & Decisions

### Technical Decisions
- **Canary Deployment**: Mandatory for all apps (10% → 50% → 100%)
- **Weekend Deployments**: Consider for highest-risk apps (mg-booking)
- **Monitoring Period**: Extended to 2 weeks for critical apps
- **Rollback Triggers**: Automated for business metric degradation
- **Approval Process**: Manual approval required at each canary stage

### Open Questions
- [ ] Should mg-booking be deployed during off-peak hours?
- [ ] Do we need dedicated war room during mg-booking migration?
- [ ] Should we notify customers in advance of mg-booking migration?
- [ ] Do we need executive sign-off at each canary stage?
- [ ] Should we implement gradual rollout by geography (AU first, then NZ)?

### Assumptions
- Previous 15 SPAs are stable on Vite
- Canary deployment infrastructure is ready
- Business metrics monitoring is accurate
- Rollback procedures are tested and reliable
- Stakeholders are available for approvals
- No major feature releases planned during migration period
- On-call coverage arranged for migration period

### Success Criteria
- All 10 SPAs migrated successfully within sprint 6
- Zero customer-impacting incidents
- Zero revenue impact
- Conversion rates maintained or improved
- Build time improvements of 50%+ achieved
- Business metrics stable or improved
- Executive confidence in migration approach validated
- **100% of SPA estate on Vite builds** ✅

### Risk Mitigation
- War room setup for mg-booking migration
- Executive escalation path clearly defined
- Customer support briefed and ready
- Marketing team prepared for potential communication
- Rollback testing completed for all apps
- Business continuity plan activated
- 24/7 platform team coverage during critical migrations

---

**Story Owner**: Platform Team Lead
**Created**: 2025-12-15
**Last Updated**: 2025-12-15
**Status**: Ready for Development

**FINAL MIGRATION PHASE - HIGHEST STAKES - PROCEED WITH MAXIMUM CAUTION**
