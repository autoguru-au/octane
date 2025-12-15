# Story: GDU. Build Tooling. As a Platform Engineer, I want to migrate internal SSR apps to React Router 7, so that I can validate the migration strategy with lower risk

## Story Details

**Story ID**: AG-TBD-022
**Epic**: AG-TBD-000 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 8
**Sprint**: Sprint 10

## Description

### Summary
We need to migrate our internal and admin-facing SSR applications from Next.js to React Router 7 as the first production rollout. These applications have fewer users and lower business risk, making them ideal candidates to validate our migration strategy, deployment process, and monitoring setup before tackling customer-facing applications.

This migration serves as a crucial proving ground for our RR7 infrastructure, allowing us to identify and resolve any issues in a controlled, lower-stakes environment.

### Background
After completing the Vite migration for CSR applications and setting up React Router 7 infrastructure (CDK, Lambda Web Adapter, build scripts), we're ready to begin migrating SSR applications. Internal tools like platform management, admin dashboards, and internal reporting tools are the logical first candidates because:
- Lower user volume (fewer than 50 active users)
- Internal stakeholders who can tolerate brief disruptions
- Simpler feature sets compared to customer-facing apps
- Opportunity to validate deployment pipeline end-to-end

### User Value
Platform engineers gain confidence in the RR7 migration strategy by successfully deploying to production with real traffic. Any issues discovered can be resolved before migrating higher-risk applications, reducing the chance of customer-facing incidents.

## User Persona

**Role**: Platform Engineer
**Name**: "Alex the Platform Engineer"
**Context**: Managing the build tooling migration while minimizing risk to production systems
**Goals**: Successfully migrate SSR apps with zero customer impact, validate monitoring and rollback procedures
**Pain Points**: Uncertainty about production readiness, concern about unknown issues affecting customers

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | All internal SSR applications identified and documented | ☐ | ☐ | ☐ |
| 2 | Each application migrated to use React Router 7 server entry point | ☐ | ☐ | ☐ |
| 3 | All existing routes continue to work identically | ☐ | ☐ | ☐ |
| 4 | SSR rendering produces identical HTML output for key pages | ☐ | ☐ | ☐ |
| 5 | Authentication and authorization work correctly | ☐ | ☐ | ☐ |
| 6 | API integrations function properly | ☐ | ☐ | ☐ |
| 7 | Data fetching in loaders works correctly | ☐ | ☐ | ☐ |
| 8 | Form submissions and mutations work properly | ☐ | ☐ | ☐ |
| 9 | Error boundaries catch and display errors appropriately | ☐ | ☐ | ☐ |
| 10 | Deployed to dev environment successfully | ☐ | ☐ | ☐ |
| 11 | Deployed to staging environment successfully | ☐ | ☐ | ☐ |
| 12 | Deployed to production environment successfully | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Page load time within 10% of Next.js baseline | ☐ | ☐ | ☐ |
| 2 | Lambda cold start time under 3 seconds | ☐ | ☐ | ☐ |
| 3 | Lambda warm response time under 500ms | ☐ | ☐ | ☐ |
| 4 | No memory leaks during 24-hour monitoring period | ☐ | ☐ | ☐ |
| 5 | CloudWatch logs capture all errors and warnings | ☐ | ☐ | ☐ |
| 6 | X-Ray tracing shows request flow correctly | ☐ | ☐ | ☐ |
| 7 | Bundle size similar to or smaller than Next.js | ☐ | ☐ | ☐ |
| 8 | Works correctly across Chrome, Firefox, Safari, Edge | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle Lambda cold starts gracefully without user-facing errors | ☐ | ☐ | ☐ |
| 2 | Graceful degradation when Lambda times out (30s limit) | ☐ | ☐ | ☐ |
| 3 | Proper error pages for 404, 500 errors | ☐ | ☐ | ☐ |
| 4 | Handle concurrent deployments without downtime | ☐ | ☐ | ☐ |
| 5 | Rollback to Next.js version works within 5 minutes | ☐ | ☐ | ☐ |

## Technical Implementation

### Frontend (MFE: `gdu`)

#### Application Identification
Identify all internal SSR applications in `/packages/gdu/apps/`:
- Platform management tools
- Admin dashboards
- Internal reporting
- Developer tools

#### Migration Steps Per Application

1. **Create React Router entry point**
```typescript
// apps/[internal-app]/entry.server.tsx
import { createRequestHandler } from '@react-router/express';
import { ServerRouter } from 'react-router';

export default createRequestHandler({
  build: () => import('./build/server'),
  mode: process.env.NODE_ENV,
});
```

2. **Convert routes from Next.js to React Router**
```typescript
// Before (Next.js)
// pages/admin/users.tsx
export async function getServerSideProps() { ... }
export default function UsersPage() { ... }

// After (React Router)
// routes/admin/users.tsx
export async function loader({ request }: LoaderFunctionArgs) { ... }
export default function UsersPage() { ... }
```

3. **Update data fetching**
```typescript
// Convert getServerSideProps to loaders
export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const data = await fetchData(session);

  return json({ data });
}
```

4. **Update form handling**
```typescript
// Convert API routes to actions
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = await processForm(formData);

  return redirect('/success');
}
```

#### Build Configuration
```typescript
// vite.config.ts for each app
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';

export default defineConfig({
  plugins: [
    reactRouter({
      ssr: true,
      appDirectory: 'app',
      serverModuleFormat: 'esm',
    }),
  ],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: undefined, // Lambda needs single bundle
      },
    },
  },
});
```

### Backend (`mfe` CDK Infrastructure)

#### Lambda Configuration
```typescript
// mfe/lib/stacks/internal-app-stack.ts
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';

const lambda = new NodejsFunction(this, 'InternalAppFunction', {
  entry: 'dist/apps/internal-app/server.js',
  handler: 'handler',
  runtime: Runtime.NODEJS_20_X,
  architecture: Architecture.ARM_64,
  memorySize: 512,
  timeout: Duration.seconds(30),
  environment: {
    NODE_ENV: 'production',
    AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
    PORT: '8080',
  },
  bundling: {
    minify: true,
    sourceMap: true,
    target: 'es2022',
    externalModules: ['aws-sdk'],
  },
  layers: [lambdaWebAdapterLayer],
});
```

#### CloudFront Configuration
```typescript
// Update CloudFront distribution
const distribution = new Distribution(this, 'InternalAppDistribution', {
  defaultBehavior: {
    origin: new HttpOrigin(lambdaFunctionUrl.domainName, {
      protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
    }),
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: new CachePolicy(this, 'InternalAppCachePolicy', {
      cachePolicyName: 'InternalAppSSRCachePolicy',
      minTtl: Duration.seconds(0),
      maxTtl: Duration.minutes(5),
      defaultTtl: Duration.minutes(1),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    }),
  },
});
```

### Integration Points

#### Auth0 Integration
- **Authentication**: Verify Auth0 session handling works in RR7 loaders
- **Authorization**: Validate role-based access control
- **Session Management**: Ensure session cookies are properly handled

#### Internal APIs
- **GraphQL**: Verify Relay queries work in loaders
- **REST APIs**: Test fetch calls in loaders and actions
- **Error Handling**: Ensure API errors are caught and displayed

### Monitoring Setup

#### CloudWatch Dashboards
```typescript
const dashboard = new Dashboard(this, 'InternalAppDashboard', {
  dashboardName: 'ReactRouter7-InternalApps',
  widgets: [
    [
      new GraphWidget({
        title: 'Lambda Invocations',
        left: [lambda.metricInvocations()],
      }),
      new GraphWidget({
        title: 'Lambda Duration',
        left: [lambda.metricDuration()],
      }),
    ],
    [
      new GraphWidget({
        title: 'Lambda Errors',
        left: [lambda.metricErrors()],
      }),
      new GraphWidget({
        title: 'Lambda Throttles',
        left: [lambda.metricThrottles()],
      }),
    ],
  ],
});
```

#### CloudWatch Alarms
```typescript
// Error rate alarm
new Alarm(this, 'HighErrorRate', {
  metric: lambda.metricErrors(),
  threshold: 5,
  evaluationPeriods: 2,
  treatMissingData: TreatMissingData.NOT_BREACHING,
  alarmDescription: 'Internal app error rate too high',
  comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
});

// Duration alarm
new Alarm(this, 'HighDuration', {
  metric: lambda.metricDuration(),
  threshold: 3000, // 3 seconds
  evaluationPeriods: 3,
  alarmDescription: 'Internal app response time too high',
});
```

## UI/UX Specifications

### Design References
- **Status**: No UI changes expected - internal apps maintain existing design
- **Validation**: Visual regression testing to ensure pixel-perfect consistency

### Expected Behavior
All existing functionality must work identically to Next.js version:
- Navigation between pages
- Form submissions
- Data tables and lists
- Modal dialogs
- Loading states
- Error messages

## Test Scenarios

### Happy Path
1. User authenticates via Auth0
2. User navigates to dashboard
3. Dashboard loads with SSR data within 2 seconds
4. User clicks through to detail page
5. Detail page loads with correct data
6. User submits form successfully
7. Success message displays, data updates

### Error Scenarios

#### Network Failure
1. Simulate API timeout
2. Verify error boundary catches error
3. Verify user sees friendly error message
4. Verify error logged to CloudWatch

#### Lambda Cold Start
1. Invoke function after 15 minutes idle
2. Measure cold start duration
3. Verify under 3 seconds
4. Verify no user-facing errors

#### Invalid Authentication
1. Remove or corrupt auth token
2. Attempt to access protected page
3. Verify redirect to login
4. Verify no sensitive data exposed

### Performance Tests

#### Load Testing
- **Concurrent Users**: 20 simultaneous users
- **Duration**: 5 minutes sustained load
- **Success Criteria**:
  - 99% success rate
  - p95 response time < 1 second
  - No memory leaks

#### Stress Testing
- **Ramp up**: 0 to 50 users over 10 minutes
- **Hold**: 50 users for 5 minutes
- **Success Criteria**:
  - Lambda auto-scales appropriately
  - No timeouts or errors
  - Response times remain acceptable

## Rollback Plan

### Pre-Deployment Checklist
- [ ] Next.js version tagged in git
- [ ] CloudFront distribution config backed up
- [ ] Lambda function ARN documented
- [ ] Rollback procedure tested in staging

### Rollback Triggers
Rollback immediately if any occur:
- Error rate > 5% for 5 minutes
- Response time p95 > 5 seconds
- Any critical feature non-functional
- Memory leaks detected

### Rollback Procedure
```bash
# 1. Switch CloudFront origin back to Next.js Lambda
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --distribution-config file://nextjs-config.json

# 2. Create CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

# 3. Wait for invalidation (usually < 5 minutes)
aws cloudfront wait invalidation-completed \
  --distribution-id $DISTRIBUTION_ID \
  --id $INVALIDATION_ID

# 4. Verify Next.js serving traffic
curl -I https://internal-app.autoguru.com.au

# 5. Notify team in Slack
```

**Expected Rollback Time**: 5-10 minutes

## Communication Plan

### Pre-Deployment
**Timing**: 1 week before
**Audience**: Internal users, engineering team
**Channels**: Slack (#engineering), email
**Message**:
```
Hi team,

Next [DATE] we're upgrading our internal admin tools to use new infrastructure (React Router 7).

What to expect:
- Brief deployment during [TIME WINDOW]
- All functionality should work identically
- Report any issues to #platform-team

Questions? Ask in #platform-team
```

### During Deployment
**Audience**: Engineering team
**Channel**: Slack (#deployments)
**Updates**: Every 15 minutes during deployment window

### Post-Deployment
**Timing**: 24 hours after, 1 week after
**Audience**: Internal users, engineering team
**Message**:
```
Internal tools migration complete ✓

Status: Monitoring for 1 week
Performance: [metrics summary]
Issues: [none | list]

Next: Supplier portal migration in Sprint 10
```

## Monitoring and Success Metrics

### Week 1 Monitoring (Intensive)
- [ ] Check CloudWatch dashboards 3x daily
- [ ] Review error logs daily
- [ ] Analyze performance metrics daily
- [ ] Collect user feedback via Slack
- [ ] Document all issues and resolutions

### Success Metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Error Rate | < 0.1% | ___ |
| p50 Response Time | < 300ms | ___ |
| p95 Response Time | < 1000ms | ___ |
| p99 Response Time | < 2000ms | ___ |
| Cold Start p95 | < 3000ms | ___ |
| Availability | 99.9% | ___ |
| User Reported Issues | 0 | ___ |

### Lessons Learned Template
```markdown
## Internal SSR Apps Migration - Lessons Learned

### What Went Well
-
-

### Issues Encountered
- Issue:
  Resolution:
  Prevention:

### Recommendations for Next Migration
-
-

### Updated Procedures
-
```

## Definition of Done

### Development Complete
- [ ] All internal SSR apps migrated to RR7
- [ ] All routes working identically to Next.js
- [ ] All forms and mutations working
- [ ] All data fetching via loaders working
- [ ] Error boundaries implemented
- [ ] Unit tests updated and passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed and approved

### Testing Complete
- [ ] Manual testing completed for all apps
- [ ] Authentication/authorization tested
- [ ] All user flows tested and documented
- [ ] Performance testing completed (load, stress)
- [ ] Cross-browser testing completed
- [ ] Accessibility testing completed (keyboard nav, screen readers)
- [ ] Visual regression tests passing

### Deployment Complete
- [ ] Deployed to dev environment
- [ ] Dev environment tested for 2 days minimum
- [ ] Deployed to staging environment
- [ ] Staging tested for 3 days minimum
- [ ] Deployed to production environment
- [ ] Production monitored for 1 week
- [ ] No rollbacks required

### Documentation Complete
- [ ] Migration steps documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Monitoring dashboards created
- [ ] Runbook updated
- [ ] Lessons learned documented
- [ ] Next migration plan updated based on learnings

## Dependencies

### Blocked By
- AG-TBD-015: Lambda Web Adapter integration (must be complete)
- AG-TBD-016: CDK infrastructure setup (must be complete)
- AG-TBD-017: Build scripts for RR7 (must be complete)
- AG-TBD-021: Migration testing in staging (must pass successfully)

### Blocks
- AG-TBD-023: Migrate supplier portal (waiting for internal app validation)
- AG-TBD-024: Migrate fleet management (waiting for internal app validation)

### Related Stories
- AG-TBD-018: Parallel run strategy (monitoring approach)
- AG-TBD-019: Feature flags (rollout control)
- AG-TBD-026: Final optimization (performance tuning)

## Story Points Justification

**Complexity Factors**:

- **Frontend Complexity**: Medium-High
  - Multiple internal applications to migrate (3-5 apps)
  - Route conversion requires careful mapping
  - Data fetching patterns need conversion from getServerSideProps to loaders
  - Form handling needs conversion to actions
  - Estimated: 2-3 days per application

- **Backend Complexity**: Medium
  - CDK infrastructure already set up (AG-TBD-016)
  - Lambda configuration is straightforward
  - CloudFront integration tested in staging
  - Estimated: 1-2 days for all apps

- **Testing Effort**: High
  - Each application needs full regression testing
  - Performance testing for each app
  - Authentication flows must be validated
  - Load testing required
  - 1 week monitoring period
  - Estimated: 3-4 days

- **Integration Points**: 4-5
  - Auth0 authentication
  - Internal GraphQL APIs
  - Lambda + CloudFront
  - CloudWatch monitoring
  - X-Ray tracing

- **Unknown Factors**:
  - Potential undocumented Next.js behaviors
  - Lambda cold start performance in production
  - Unforeseen RR7 migration issues
  - User feedback may reveal edge cases

**Total Points**: 8

**Breakdown**:
- Application migration work: 5 points (multiple apps, route conversion)
- Testing and validation: 2 points (comprehensive testing required)
- Deployment and monitoring: 1 point (deploy to all environments, week-long monitoring)

## Notes & Decisions

### Technical Decisions

- **Deploy all internal apps together**: Rationale: Simplifies infrastructure management, all internal apps share similar characteristics
- **1 week monitoring period**: Rationale: Provides sufficient time to identify issues before migrating customer-facing apps
- **Aggressive rollback triggers**: Rationale: Internal apps are low-risk, but we want to validate rollback procedures

### Open Questions
- [ ] Which specific internal applications are in scope? (Need list from product team)
- [ ] Do any internal apps have special authentication requirements?
- [ ] What is the acceptable maintenance window for deployment?
- [ ] Who are the key internal users to notify?

### Assumptions
- Internal applications have similar architecture and complexity
- Auth0 integration works identically in RR7 as Next.js
- Lambda Web Adapter layer is stable and production-ready
- Internal users can tolerate brief disruptions if issues arise
- CloudWatch and X-Ray provide sufficient observability

### Risk Assessment

**Risk Level**: Medium

**Key Risks**:
1. **Undiscovered RR7 Issues** (Medium probability, High impact)
   - Mitigation: Extensive staging testing, aggressive monitoring

2. **Lambda Cold Start Performance** (Medium probability, Medium impact)
   - Mitigation: Provisioned concurrency if needed, monitoring thresholds

3. **Authentication Issues** (Low probability, High impact)
   - Mitigation: Thorough auth testing in staging, rollback plan ready

4. **CDK Infrastructure Issues** (Low probability, High impact)
   - Mitigation: Infrastructure tested in AG-TBD-021, rollback plan ready

**Overall Risk Posture**: Acceptable for first production rollout given lower user impact of internal applications.
