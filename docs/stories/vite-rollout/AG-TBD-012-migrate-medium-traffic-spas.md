# Story: PM. Build Tooling. As a Platform Engineer, I want to migrate 10 medium-traffic SPAs to Vite builds, so that we can expand the migration to customer-facing features with proven confidence

## Story Details

**Story ID**: AG-TBD-012
**Epic**: AG-TBD - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Should Have
**Story Points**: 21
**Sprint**: 5

## Description

### Summary

With 5 low-traffic SPAs successfully migrated and our playbook validated, it's time to expand the Vite migration to medium-traffic applications. This phase includes 10 SPAs with moderate user traffic, including some customer-facing B2C features and supplier portal components. These apps have more users and higher business importance than the low-traffic apps, but aren't yet critical booking or marketplace flows.

This migration phase represents a significant scale-up from phase 1, doubling the number of applications and including apps that directly serve customers and suppliers. We'll apply learnings from phase 1, coordinate more closely with owning teams, and implement more rigorous testing and monitoring procedures.

### Background

Phase 1 validated that our migration process works well for low-traffic apps. We've refined the playbook, built confidence in the tooling, and established efficient workflows. Now we're ready to tackle apps with real user impact, where performance improvements will be more visible and valuable.

Medium-traffic SPAs typically serve specific features in our supplier portal, fleet management tools, and some B2C consumer features. These apps see hundreds to thousands of daily users and are important to business operations but have fallback options if issues occur.

### User Value

Platform engineers will prove the migration scales to meaningful business features, while developers will benefit from faster build times on apps they actively work on. Customers and suppliers will indirectly benefit from faster deployment cycles, enabling quicker bug fixes and feature releases. The business gains confidence in the migration approach for high-traffic apps.

## User Persona

**Role**: Platform Engineer
**Name**: "Alex the Platform Engineer"
**Context**: Scaling Vite migration to customer-facing features
**Goals**: Maintain zero regressions, coordinate with multiple teams, manage higher-risk deployments
**Pain Points**: Increased stakeholder pressure, coordination complexity, higher impact of any issues

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | 10 medium-traffic SPAs selected based on traffic, business value, and team readiness | ☐ | ☐ | ☐ |
| 2 | Each SPA builds successfully with Vite across all environments (dev, test, uat, preprod, prod, dockerprod, shared) | ☐ | ☐ | ☐ |
| 3 | Build manifests for each SPA validated against webpack baseline | ☐ | ☐ | ☐ |
| 4 | Multi-tenant SPAs build correctly for all tenants (au, nz, global) | ☐ | ☐ | ☐ |
| 5 | All MFE loading mechanisms work correctly in production | ☐ | ☐ | ☐ |
| 6 | All existing unit tests pass for each SPA | ☐ | ☐ | ☐ |
| 7 | All existing integration tests pass for each SPA | ☐ | ☐ | ☐ |
| 8 | All existing E2E tests pass for each SPA | ☐ | ☐ | ☐ |
| 9 | Production deployments successful for all 10 SPAs | ☐ | ☐ | ☐ |
| 10 | No critical or high-priority issues during 1 week monitoring per app | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Build time improved by at least 50% for each SPA | ☐ | ☐ | ☐ |
| 2 | Bundle sizes remain same or smaller (max 5% increase) | ☐ | ☐ | ☐ |
| 3 | Page load performance maintained or improved (New Relic metrics) | ☐ | ☐ | ☐ |
| 4 | Zero accessibility regressions (WCAG AA compliance maintained) | ☐ | ☐ | ☐ |
| 5 | User-reported issues <0.1% of user sessions | ☐ | ☐ | ☐ |
| 6 | CI/CD pipeline success rate >95% for migrated apps | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | SPAs with complex routing handle navigation correctly | ☐ | ☐ | ☐ |
| 2 | SPAs with dynamic imports/code-splitting work correctly | ☐ | ☐ | ☐ |
| 3 | SPAs integrated with other MFEs maintain integration points | ☐ | ☐ | ☐ |
| 4 | Feature flags and A/B tests continue working correctly | ☐ | ☐ | ☐ |
| 5 | Analytics and tracking continue functioning correctly | ☐ | ☐ | ☐ |

## Technical Implementation

### SPA Selection Criteria

**Medium-Traffic SPA Candidates** (10 apps):

#### Supplier Portal Apps (4 apps)
1. **sp-pricing** (Supplier Portal Pricing)
   - Type: SPA, Supplier-facing
   - Traffic: Medium (200-500 DAU)
   - Criticality: High (pricing management)
   - Complexity: Medium (pricing calculations, multi-tenant)

2. **sp-account-pricing-settings** (Supplier Portal Account Pricing Settings)
   - Type: SPA, Supplier-facing
   - Traffic: Medium (150-300 DAU)
   - Criticality: Medium (account configuration)
   - Complexity: Medium

3. **sp-resource** (Supplier Portal Resource)
   - Type: SPA, Supplier-facing
   - Traffic: Medium (200-400 DAU)
   - Criticality: Medium (resource management)
   - Complexity: Medium

4. **sp-guide** (Supplier Portal Training Guides)
   - Type: SPA, Supplier-facing
   - Traffic: Low-medium (100-200 DAU)
   - Criticality: Low (documentation)
   - Complexity: Low

#### Fleet Portal Apps (3 apps)
5. **fcp-portfolio** (Fleet Client Portal Portfolio)
   - Type: SPA, Fleet client-facing
   - Traffic: Medium (300-600 DAU)
   - Criticality: High (vehicle management)
   - Complexity: Medium-high

6. **fcp-account** (Fleet Client Portal Account)
   - Type: SPA, Fleet client-facing
   - Traffic: Medium (250-500 DAU)
   - Criticality: High (account management)
   - Complexity: Medium

7. **fcp-users** (Fleet Client Portal Users)
   - Type: SPA, Fleet client-facing
   - Traffic: Medium (200-400 DAU)
   - Criticality: Medium (user management)
   - Complexity: Medium

#### B2C Consumer Apps (2 apps)
8. **homepage** (Homepage)
   - Type: SPA, Consumer-facing
   - Traffic: Medium (varies by tenant)
   - Criticality: Medium (landing page)
   - Complexity: Low-medium

9. **mg-home** (My Garage Home)
   - Type: SPA, Consumer-facing
   - Traffic: Medium (500-1000 DAU)
   - Criticality: Medium (user dashboard)
   - Complexity: Medium

#### Fleet Management Ops (1 app)
10. **fmo-portfolio** (Fleet Portal Portfolio)
    - Type: SPA, Fleet ops-facing
    - Traffic: Medium (200-400 DAU)
    - Criticality: High (portfolio management)
    - Complexity: Medium-high

**Selection Rationale**:
- Mix of supplier, fleet, and consumer-facing features
- Medium traffic levels (100-1000 DAU range)
- Important but not critical booking/payment flows
- Variety of complexity levels
- Active development teams for coordination
- Cover multiple platforms (B2C, Fleet, Supplier)

### Migration Approach

#### Pre-Migration Coordination (1 week before)

```markdown
## Team Coordination Checklist

### For Each SPA:

**Communication**:
- [ ] Notify owning team of migration plans
- [ ] Schedule pre-migration sync meeting
- [ ] Identify team's on-call contact
- [ ] Confirm deployment windows
- [ ] Align on testing requirements

**Technical Review**:
- [ ] Review recent changes to app
- [ ] Identify any custom webpack config
- [ ] Check for any planned deployments
- [ ] Review current test coverage
- [ ] Identify critical user flows

**Risk Assessment**:
- [ ] Document business impact of downtime
- [ ] Identify rollback contacts
- [ ] Confirm monitoring dashboards
- [ ] Review incident response plan
- [ ] Set success criteria with team
```

#### Migration Sequence

**Week 1** (Sprint 5, Days 1-5):
- Day 1-2: sp-guide (lowest risk)
- Day 2-3: sp-resource
- Day 3-4: sp-account-pricing-settings
- Day 4-5: homepage

**Week 2** (Sprint 5, Days 6-10):
- Day 6-7: mg-home
- Day 7-8: fcp-users
- Day 8-9: fcp-account
- Day 9-10: sp-pricing

**Week 3** (Sprint 5, Days 11-12):
- Day 11: fcp-portfolio
- Day 12: fmo-portfolio

**Rationale**: Sequence from lower to higher complexity/criticality within each week, allowing learning and building confidence progressively.

### Enhanced Testing Strategy

#### Automated Testing

```typescript
// Enhanced E2E testing for medium-traffic apps
describe('Vite Migration Validation - [APP-NAME]', () => {
  describe('Core Functionality', () => {
    it('loads without JavaScript errors', async () => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');

      expect(errors).toHaveLength(0);
    });

    it('renders primary UI elements', async () => {
      await page.goto(APP_URL);

      // App-specific assertions
      await expect(page.locator('[data-testid="app-shell"]')).toBeVisible();
      await expect(page.locator('[data-testid="navigation"]')).toBeVisible();
    });

    it('handles navigation correctly', async () => {
      await page.goto(APP_URL);

      // Test key navigation flows
      await page.click('[data-testid="nav-link-1"]');
      await expect(page).toHaveURL(/.*\/route-1/);
    });
  });

  describe('Performance', () => {
    it('meets page load performance targets', async () => {
      await page.goto(APP_URL);

      const performanceMetrics = await page.evaluate(() => {
        const timing = performance.timing;
        return {
          loadTime: timing.loadEventEnd - timing.navigationStart,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
        };
      });

      expect(performanceMetrics.loadTime).toBeLessThan(3000);
    });
  });

  describe('Multi-Tenant Support', () => {
    if (isMultiTenant) {
      for (const tenant of ['au', 'nz', 'global']) {
        it(`loads correctly for ${tenant} tenant`, async () => {
          await page.goto(`${APP_URL}?tenant=${tenant}`);
          await expect(page.locator('[data-tenant]')).toHaveAttribute('data-tenant', tenant);
        });
      }
    }
  });

  describe('Analytics & Tracking', () => {
    it('fires analytics events correctly', async () => {
      const analyticsEvents = [];
      page.on('request', request => {
        if (request.url().includes('analytics')) {
          analyticsEvents.push(request.postData());
        }
      });

      await page.goto(APP_URL);
      await page.click('[data-analytics="primary-action"]');

      expect(analyticsEvents.length).toBeGreaterThan(0);
    });
  });
});
```

#### Performance Benchmarking

```typescript
// Performance comparison script
interface PerformanceMetrics {
  app: string;
  bundler: 'webpack' | 'vite';
  metrics: {
    buildTime: number;
    bundleSize: number;
    chunkCount: number;
    largestChunk: number;
    totalAssets: number;
    pageLoadTime: number;
    timeToInteractive: number;
    firstContentfulPaint: number;
  };
}

const runPerformanceComparison = async (appName: string) => {
  // Build with both bundlers
  const webpackMetrics = await buildAndMeasure(appName, 'webpack');
  const viteMetrics = await buildAndMeasure(appName, 'vite');

  // Compare and report
  const comparison = {
    app: appName,
    buildTimeImprovement: calculateImprovement(
      webpackMetrics.buildTime,
      viteMetrics.buildTime
    ),
    bundleSizeChange: calculateChange(
      webpackMetrics.bundleSize,
      viteMetrics.bundleSize
    ),
    pageLoadChange: calculateChange(
      webpackMetrics.pageLoadTime,
      viteMetrics.pageLoadTime
    ),
  };

  // Assert targets met
  expect(comparison.buildTimeImprovement).toBeGreaterThan(50); // >50% faster
  expect(comparison.bundleSizeChange).toBeLessThan(5); // <5% increase
  expect(comparison.pageLoadChange).toBeLessThan(10); // <10% change

  return comparison;
};
```

### Enhanced Monitoring

#### New Relic Dashboards

```sql
-- Custom dashboard queries for medium-traffic apps

-- 1. Page Load Performance (compare before/after migration)
SELECT
  percentile(duration, 50) as p50,
  percentile(duration, 95) as p95,
  percentile(duration, 99) as p99
FROM PageView
WHERE appName IN ('sp-pricing', 'fcp-portfolio', 'mg-home', ...)
FACET appName, releaseId
SINCE 2 weeks ago
TIMESERIES

-- 2. JavaScript Error Rate
SELECT
  count(*) as errorCount,
  count(*) / uniqueCount(session) * 100 as errorRate
FROM JavaScriptError
WHERE appName IN ('sp-pricing', 'fcp-portfolio', 'mg-home', ...)
FACET appName, errorMessage
SINCE 1 week ago

-- 3. User Satisfaction (Apdex)
SELECT
  apdex(duration, t: 2.0) as apdexScore
FROM PageView
WHERE appName IN ('sp-pricing', 'fcp-portfolio', 'mg-home', ...)
FACET appName
SINCE 1 week ago
TIMESERIES

-- 4. Asset Loading Performance
SELECT
  average(duration) as avgLoadTime,
  count(*) as totalRequests
FROM PageAction
WHERE actionName = 'assetLoad'
  AND appName IN ('sp-pricing', 'fcp-portfolio', 'mg-home', ...)
FACET assetType, appName
SINCE 1 week ago

-- 5. User Journey Completion
SELECT
  funnel(
    session,
    WHERE pageUrl LIKE '%/pricing%' as 'Pricing Page',
    WHERE pageUrl LIKE '%/pricing/edit%' as 'Edit Pricing',
    WHERE actionName = 'pricingSaved' as 'Save Success'
  )
FROM PageView, PageAction
WHERE appName = 'sp-pricing'
SINCE 1 week ago
```

#### Alerting Configuration

```typescript
// New Relic alert conditions for migrated apps
const alertConditions = [
  {
    name: 'Vite Migration - Elevated Error Rate',
    apps: MIGRATED_APPS,
    condition: 'errorRate > 1%', // More than 1% of sessions have errors
    severity: 'critical',
    notification: ['#platform-engineering', 'pagerduty'],
  },
  {
    name: 'Vite Migration - Performance Degradation',
    apps: MIGRATED_APPS,
    condition: 'p95Duration > baseline * 1.2', // 20% slower than baseline
    severity: 'warning',
    notification: ['#platform-engineering'],
  },
  {
    name: 'Vite Migration - Asset Loading Failure',
    apps: MIGRATED_APPS,
    condition: 'assetLoadFailureRate > 0.5%',
    severity: 'critical',
    notification: ['#platform-engineering', 'pagerduty'],
  },
  {
    name: 'Vite Migration - User Journey Dropoff',
    apps: MIGRATED_APPS,
    condition: 'funnelCompletionRate < baseline * 0.9', // 10% drop in completion
    severity: 'warning',
    notification: ['#platform-engineering', 'product-team'],
  },
];
```

### Rollback Criteria & Procedures

#### Automated Rollback Triggers

```typescript
// Automated health checks for rollback decision
interface HealthCheck {
  app: string;
  checks: {
    errorRate: boolean; // < 1%
    performanceDegradation: boolean; // < 20% slower
    assetLoadFailures: boolean; // < 0.5%
    buildSuccess: boolean; // CI/CD passing
  };
  overall: 'healthy' | 'degraded' | 'critical';
}

const performHealthCheck = async (appName: string): Promise<HealthCheck> => {
  const metrics = await fetchNewRelicMetrics(appName);

  return {
    app: appName,
    checks: {
      errorRate: metrics.errorRate < 0.01,
      performanceDegradation: metrics.p95Duration < metrics.baseline * 1.2,
      assetLoadFailures: metrics.assetFailureRate < 0.005,
      buildSuccess: await checkCIStatus(appName),
    },
    overall: determineOverallHealth(metrics),
  };
};

// Automatic rollback if health critical
const monitorAndRollback = async (appName: string) => {
  const health = await performHealthCheck(appName);

  if (health.overall === 'critical') {
    console.error(`Critical health issues detected for ${appName}`);
    await initiateRollback(appName);
    await notifyTeam({
      channel: '#platform-engineering',
      message: `🚨 Automatic rollback initiated for ${appName} due to critical health issues`,
      details: health,
    });
  }
};
```

### Coordination with Owning Teams

#### Pre-Migration Meeting Agenda

```markdown
## Vite Migration Pre-Flight: [APP-NAME]

**Attendees**: Platform team, Owning team lead, QA, Product owner (if needed)
**Duration**: 30 minutes
**Date**: [1 week before migration]

### Agenda

1. **Migration Overview** (5 min)
   - What's changing (webpack → Vite)
   - Why we're doing this
   - Expected benefits

2. **Timeline & Sequence** (5 min)
   - Migration schedule
   - Environment progression
   - Deployment windows
   - Monitoring period

3. **Testing Requirements** (5 min)
   - Automated tests expected to pass
   - Manual testing needed
   - QA involvement
   - Acceptance criteria

4. **Risk & Rollback** (5 min)
   - Potential issues
   - Rollback triggers
   - Rollback procedure
   - Contact points

5. **Team Responsibilities** (5 min)
   - Platform team: Migration execution, monitoring
   - Owning team: Testing, validation, user communication
   - QA: Test execution, sign-off
   - On-call: Issue response

6. **Q&A** (5 min)
   - Address concerns
   - Clarify expectations
   - Confirm communication plan

### Action Items
- [ ] Platform team: Schedule migration window
- [ ] Owning team: Complete pre-migration testing
- [ ] QA: Prepare test plan
- [ ] All: Add to calendars, set up monitoring
```

## Testing Requirements

### Comprehensive Test Matrix

| SPA | Unit Tests | Integration Tests | E2E Tests | Manual Testing | Performance Tests | Accessibility |
|-----|------------|-------------------|-----------|----------------|-------------------|---------------|
| sp-pricing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| sp-account-pricing-settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| sp-resource | ✅ | ✅ | ✅ | ⚠️ Basic | ✅ | ✅ |
| sp-guide | ✅ | ✅ | ⚠️ Basic | ⚠️ Basic | ✅ | ✅ |
| fcp-portfolio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fcp-account | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fcp-users | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| homepage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| mg-home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| fmo-portfolio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

✅ = Full testing required
⚠️ = Basic/smoke testing acceptable

### User Acceptance Testing

```markdown
## UAT Plan: [APP-NAME]

**Tester**: [Product Owner / Key User]
**Environment**: UAT
**Date**: [Date]
**Duration**: 30-60 minutes

### Critical User Flows

#### Flow 1: [Primary Flow]
**Steps**:
1. Navigate to [URL]
2. [Action 1]
3. [Action 2]
4. [Expected Result]

**Acceptance**:
- [ ] Flow completes successfully
- [ ] No errors or warnings
- [ ] Performance feels same or better
- [ ] UI/UX unchanged

#### Flow 2: [Secondary Flow]
**Steps**:
1. [Step 1]
2. [Step 2]
3. [Expected Result]

**Acceptance**:
- [ ] Flow completes successfully
- [ ] Data saves correctly
- [ ] Validation works as expected

### Non-Functional Testing

- [ ] Mobile responsive (test on phone)
- [ ] Works in Safari, Chrome, Firefox
- [ ] Keyboard navigation works
- [ ] No visual regressions
- [ ] Load time acceptable

### Sign-Off

- [ ] Product Owner approval
- [ ] QA approval
- [ ] Ready for production
```

## Communication Plan

### Weekly Status Updates

```markdown
## Vite Migration Status - Week [X] of Sprint 5

**Overall Progress**: [X/10] SPAs migrated to production

### This Week's Migrations

✅ **Completed**:
- sp-guide: Migrated Mon-Tue, monitoring for 3 days
- sp-resource: Migrated Wed-Thu, monitoring for 1 day
- sp-account-pricing-settings: Migrated Fri, monitoring started

🚧 **In Progress**:
- homepage: In UAT validation
- mg-home: Local testing complete, deploying to dev

📋 **Upcoming**:
- fcp-users: Scheduled for next Monday
- fcp-account: Scheduled for next Tuesday

### Metrics

**Build Performance**:
- Average build time improvement: 62%
- Average bundle size change: -3% (smaller)
- CI/CD pipeline time reduced by: 45%

**Production Health**:
- Error rate: 0.02% (within normal range)
- Performance: No degradation detected
- User-reported issues: 0

**Issues & Resolutions**:
1. sp-resource: Translation caching issue
   - Root cause: Cache key mismatch
   - Resolution: Updated hash algorithm
   - Time to resolve: 2 hours
   - Playbook updated: Yes

### Learnings

- Multi-tenant apps require extra validation of translation loading
- Homepage requires coordination with marketing for UAT
- Performance testing especially important for consumer-facing apps

### Next Week's Plan

- Complete homepage and mg-home migrations
- Start fcp-users, fcp-account, sp-pricing
- Focus on fleet portal apps
- Final two apps (fcp-portfolio, fmo-portfolio) scheduled for week 3

### Help Needed

- Need QA availability for fcp-portfolio testing (complex app)
- Request extended UAT window for mg-home (consumer-facing)

---
Questions? Hit us up in #platform-engineering
```

### Team-Specific Communication

```markdown
To: Supplier Portal Team
Subject: Vite Migration - sp-pricing scheduled for [Date]

G'day Supplier Portal team,

We're migrating sp-pricing (Supplier Portal Pricing) to Vite builds next [Day].

**What's happening**:
- Build system upgrade (webpack → Vite)
- 60%+ faster builds expected
- Zero functionality changes
- Progressive rollout: dev → test → uat → preprod → prod

**Timeline**:
- Monday: dev deployment
- Tuesday: test deployment + QA
- Wednesday: uat deployment + product validation
- Thursday: preprod validation
- Friday: prod deployment

**What we need from you**:
1. ✅ Run your standard test suite on dev (Tuesday)
2. ✅ Product owner UAT on Wednesday
3. ✅ Be available for quick issue response
4. ✅ Report any unusual behavior ASAP

**What you'll get**:
- Faster deployments for your features
- Quicker CI/CD feedback
- Better build performance

**Communication**:
- #supplier-portal for team updates
- #platform-engineering for migration questions
- @platform-team for urgent issues

**Pre-migration checklist for your team**:
- [ ] Avoid major changes to sp-pricing this week
- [ ] Identify critical user flows for validation
- [ ] Confirm product owner available for UAT
- [ ] Review New Relic dashboard: [link]

Questions? Let's chat in #supplier-portal

Cheers,
Platform Team
```

## Rollback Plan

### Per-App Rollback Readiness

```markdown
## Rollback Readiness: [APP-NAME]

**Preparation** (before migration):
- [ ] Webpack build verified working
- [ ] Rollback PR prepared (reverts CI/CD changes)
- [ ] Rollback testing completed in lower environment
- [ ] Team contacts documented
- [ ] Rollback decision tree reviewed

**Monitoring** (during migration):
- [ ] New Relic dashboard actively monitored
- [ ] Error alerts configured
- [ ] Performance baselines established
- [ ] On-call engineer identified

**Rollback Triggers**:
- Error rate > 1% of sessions
- P95 page load > 20% slower than baseline
- Asset loading failures > 0.5%
- Critical functionality broken
- Unable to resolve issues within 4 hours

**Rollback Procedure**:
1. Stop: Halt further environment rollouts
2. Assess: Confirm rollback needed (severity, impact)
3. Notify: Alert owning team, platform team lead
4. Execute: Merge rollback PR, trigger CI/CD
5. Verify: Confirm webpack build deploys successfully
6. Monitor: Ensure issues resolved
7. Document: Create incident report
8. Review: Post-incident analysis

**Rollback Time Target**: < 30 minutes from decision to deployment
```

## Definition of Done

### Development Complete
- [ ] All 10 SPAs selected and approved by teams
- [ ] Migration playbook followed for each SPA
- [ ] Local builds successful for all 10 SPAs
- [ ] Build comparison validated for each SPA
- [ ] CI/CD pipelines updated for all 10 SPAs
- [ ] All code changes reviewed and merged

### Testing Complete
- [ ] Unit tests passing for all 10 SPAs (>80% coverage maintained)
- [ ] Integration tests passing for all 10 SPAs
- [ ] E2E tests passing for all 10 SPAs
- [ ] Manual testing completed by owning teams
- [ ] UAT completed with product owner sign-off
- [ ] Performance benchmarks met (>50% build improvement)
- [ ] Accessibility validation completed (WCAG AA)
- [ ] Cross-browser testing completed (Chrome, Safari, Firefox)
- [ ] Mobile responsive testing completed

### Deployment Complete
- [ ] All 10 SPAs deployed to dev successfully
- [ ] All 10 SPAs deployed to test successfully
- [ ] All 10 SPAs deployed to uat successfully
- [ ] All 10 SPAs deployed to preprod successfully
- [ ] All 10 SPAs deployed to prod successfully
- [ ] All 10 SPAs deployed to dockerprod successfully
- [ ] Multi-tenant deployments verified (au, nz, global)

### Monitoring Complete
- [ ] Production monitoring active for minimum 1 week per app
- [ ] No critical issues during monitoring period
- [ ] No high-priority issues unresolved
- [ ] Error rates within acceptable range (<0.1%)
- [ ] Performance metrics meeting targets
- [ ] User satisfaction maintained (Apdex score)
- [ ] New Relic dashboards showing healthy metrics

### Documentation Complete
- [ ] Migration tracking updated for all 10 SPAs
- [ ] Build metrics documented for each SPA
- [ ] Issues/learnings documented in detail
- [ ] Playbook updated with new edge cases (minimum 5 additions)
- [ ] Team coordination templates refined
- [ ] Success stories documented for sharing
- [ ] Owning teams notified of completion

### Communication Complete
- [ ] Pre-migration notifications sent to all teams
- [ ] Weekly status updates shared
- [ ] Individual team syncs completed
- [ ] Post-migration summary report created
- [ ] Engineering all-hands update delivered
- [ ] Lessons learned session conducted

## Dependencies

### Blocked By
- AG-TBD-011: Migrate low-traffic SPAs (must be successful with learnings applied)
- AG-TBD-011a: MFE migration playbook (must be refined from phase 1)

### Blocks
- AG-TBD-013: Migrate high-traffic SPAs (depends on success of this phase)

### Related Stories
- AG-TBD-010: Performance benchmarking suite (used extensively)
- AG-TBD-009: Build comparison tooling (critical for validation)

## Story Points Justification

**Complexity Factors**:
- **Scale**: Very High
  - 10 SPAs to migrate (double phase 1)
  - 70 total deployments (10 apps × 7 environments)
  - Multiple team coordination
  - Higher stakes (customer-facing apps)

- **Testing Effort**: Very High
  - Comprehensive testing per SPA
  - UAT with product owners
  - Performance validation crucial
  - Multi-tenant testing
  - Cross-browser testing

- **Coordination**: Very High
  - 5+ different team coordination
  - Product owner involvement
  - QA coordination across teams
  - Deployment window scheduling
  - Stakeholder communication

- **Risk Management**: High
  - Customer-facing apps
  - Higher impact of issues
  - More rigorous monitoring
  - Faster incident response needed

**Time Estimate**:
- Pre-migration coordination: 1 week
- Migration execution: 2.5 weeks (10 apps, some parallel)
- Testing & validation: Concurrent with execution
- Monitoring: 1 week minimum per app (overlapping)
- Documentation & communication: Ongoing throughout
- **Total**: 3 weeks (1 sprint + 1 week)

**Note**: This is larger than typical sprint capacity (21 points) but scoped for a single sprint with the understanding that monitoring continues into the next sprint.

**Total Points**: 21

## Notes & Decisions

### Technical Decisions
- **Migration Sequence**: Progress from lower to higher complexity/criticality within each week
- **Parallelization**: Stagger migrations by 1-2 days to allow learning between apps
- **Testing Rigor**: Full E2E and UAT for customer-facing apps, lighter for internal tools
- **Monitoring Period**: Minimum 1 week per app before considering fully successful
- **Team Involvement**: Require product owner sign-off for customer-facing features

### Open Questions
- [ ] Should we extend monitoring period for highest-traffic apps (sp-pricing, mg-home)?
- [ ] Do we need dedicated QA resource for this sprint given increased scope?
- [ ] Should we implement gradual percentage rollouts for highest-traffic apps?
- [ ] Do we need a dedicated communication manager for stakeholder coordination?

### Assumptions
- Learnings from phase 1 have been incorporated into playbook
- Owning teams are available for coordination and testing
- QA resources available for validation
- No major feature releases planned for these apps during migration period
- Product owners available for UAT in uat environment
- New Relic monitoring is properly configured
- Rollback capability has been validated in phase 1

### Success Criteria
- All 10 SPAs migrated successfully within sprint 5
- Zero customer-impacting incidents
- Build time improvements averaging 60%+
- Positive feedback from owning teams
- Playbook refined with significant learnings
- Engineering confidence high for phase 3 (high-traffic apps)
- Stakeholder confidence in migration approach validated

### Risk Mitigation
- Daily stand-ups during migration period
- Dedicated Slack channel for real-time communication
- Pre-migration meetings with each owning team
- Rollback readiness validated before each prod deployment
- Extended monitoring for customer-facing apps
- Escalation path clearly defined and communicated

---

**Story Owner**: Platform Team Lead
**Created**: 2025-12-15
**Last Updated**: 2025-12-15
**Status**: Ready for Development
