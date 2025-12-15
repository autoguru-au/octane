# Story: GDU. Application Migration. As a Developer, I want to migrate a pilot SSR app to React Router 7, so that we can validate the migration approach and tooling

## Story Details

**Story ID**: AG-TBD-020
**Epic**: AG-TBD-001 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 13
**Sprint**: 9

## Description

### Summary
We need to migrate one non-critical SSR application from Next.js to React Router 7 as a pilot migration. This will validate our migration approach, test all the tooling we've built (config, Lambda integration, security headers, CDK infrastructure), identify any gaps or issues, and provide a real-world example for future migrations. The pilot should be a representative application with moderate complexity - not too simple to be unrealistic, but not so complex that it's risky.

### Background
We've built all the infrastructure and tooling needed for React Router 7:
- Base configuration (AG-TBD-014)
- Lambda Web Adapter integration (AG-TBD-015)
- Security headers (AG-TBD-016)
- CDK infrastructure templates (AG-TBD-017)
- Build manifest generation (AG-TBD-018)
- Migration guide (AG-TBD-019)

Now we need to put it all together and prove it works with a real application. This pilot migration will:
1. Validate our approach and tooling
2. Identify any issues or gaps
3. Refine the migration guide
4. Provide a reference implementation
5. Build team confidence in the migration

### User Value
The team gains confidence that the React Router 7 migration approach is sound, tooling is complete, and future migrations can proceed safely. Leadership gets proof that the investment in migration infrastructure was successful.

## User Persona

**Role**: Full-Stack Developer / Tech Lead
**Name**: "Pilot Pete the Pioneer Developer"
**Context**: First developer to migrate a production app to React Router 7
**Goals**:
- Successfully migrate without breaking production
- Validate all migration tooling
- Document learnings for future migrations
- Prove performance improvements
- Get stakeholder approval for broader rollout
**Pain Points**:
- Pressure to get it right the first time
- Unknown unknowns
- Need to document everything
- Performance must meet or exceed Next.js
- Risk of production issues

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Pilot SSR application selected (non-critical, moderate complexity) | ☐ | ☐ | ☐ |
| 2 | Application migrated to React Router 7 in feature branch | ☐ | ☐ | ☐ |
| 3 | All routes functional and tested | ☐ | ☐ | ☐ |
| 4 | All data fetching migrated from getServerSideProps to loaders | ☐ | ☐ | ☐ |
| 5 | All forms migrated to React Router actions | ☐ | ☐ | ☐ |
| 6 | Security headers applied and verified | ☐ | ☐ | ☐ |
| 7 | Build manifest generated successfully | ☐ | ☐ | ☐ |
| 8 | Application deployed to dev environment | ☐ | ☐ | ☐ |
| 9 | Application deployed to UAT environment | ☐ | ☐ | ☐ |
| 10 | All automated tests passing | ☐ | ☐ | ☐ |
| 11 | Performance benchmarks meet or exceed Next.js baseline | ☐ | ☐ | ☐ |
| 12 | Stakeholder sign-off obtained | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Dev build time < 5 seconds for typical change | ☐ | ☐ | ☐ |
| 2 | Production build time < 2 minutes | ☐ | ☐ | ☐ |
| 3 | Lambda cold start < 2 seconds (p95) | ☐ | ☐ | ☐ |
| 4 | SSR response time < 500ms (p95) | ☐ | ☐ | ☐ |
| 5 | No security regressions | ☐ | ☐ | ☐ |
| 6 | No accessibility regressions | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Handle errors gracefully with error boundaries | ☐ | ☐ | ☐ |
| 2 | Graceful degradation when API unavailable | ☐ | ☐ | ☐ |
| 3 | Browser back/forward navigation works correctly | ☐ | ☐ | ☐ |
| 4 | Deep linking to all routes works | ☐ | ☐ | ☐ |

## Technical Implementation

### Pilot Application Selection Criteria

Choose an SSR app that:
- **Is non-critical**: Not high-traffic or revenue-critical
- **Has moderate complexity**: 10-20 routes, some data fetching, some forms
- **Is representative**: Uses common patterns that other apps use
- **Has good test coverage**: So we can verify nothing broke
- **Has stable requirements**: Not actively being developed

**Candidate Apps** (examples):
1. Internal admin tool
2. Documentation site
3. Developer portal
4. Support dashboard

### Migration Process

#### Phase 1: Preparation (Day 1)

1. **Create Feature Branch**
   ```bash
   git checkout -b feat/migrate-to-react-router-7
   ```

2. **Document Current State**
   - Screenshot all pages
   - Document all routes
   - Run performance baseline
   - Export current metrics

3. **Set Up React Router Structure**
   ```bash
   cd packages/pilot-app
   mkdir -p app/routes
   touch app/root.tsx
   touch react-router.config.ts
   ```

4. **Install Dependencies**
   ```bash
   yarn add react-router@7 @react-router/node @react-router/serve
   yarn add -D @types/react-router
   ```

#### Phase 2: Core Migration (Day 2-3)

1. **Create Root Layout**
   ```typescript
   // app/root.tsx
   import { Links, Meta, Outlet, Scripts } from 'react-router';

   export default function Root() {
     return (
       <html lang="en">
         <head>
           <Meta />
           <Links />
         </head>
         <body>
           <Outlet />
           <Scripts />
         </body>
       </html>
     );
   }
   ```

2. **Migrate Routes** (one by one)
   - Start with simplest routes
   - Move to complex routes
   - Test each route before moving to next

3. **Migrate Data Fetching**
   - Convert `getServerSideProps` to `loader`
   - Convert API routes to actions
   - Test data flows

4. **Migrate Forms**
   - Convert to React Router `<Form>`
   - Add actions for form handling
   - Test form submissions

#### Phase 3: Infrastructure (Day 4)

1. **Configure Build**
   ```typescript
   // react-router.config.ts
   import { createReactRouterConfig } from '@autoguru/gdu/config/react-router';

   export default createReactRouterConfig('prod');
   ```

2. **Set Up Lambda Handler**
   - Use GDU Lambda handler
   - Configure environment variables
   - Test locally

3. **Create CDK Stack**
   ```bash
   cd mfe/infrastructure
   cdk bootstrap # if needed
   ```

4. **Deploy to Dev**
   ```bash
   gdu build --env dev
   cdk deploy pilot-app-dev
   ```

#### Phase 4: Testing (Day 5)

1. **Manual Testing**
   - [ ] Test all routes
   - [ ] Test all forms
   - [ ] Test navigation
   - [ ] Test error states
   - [ ] Test loading states
   - [ ] Test browser back/forward

2. **Automated Testing**
   - [ ] Run unit tests
   - [ ] Run integration tests
   - [ ] Run E2E tests
   - [ ] Fix any failures

3. **Performance Testing**
   - [ ] Measure build times
   - [ ] Measure Lambda cold starts
   - [ ] Measure SSR response times
   - [ ] Measure client-side performance
   - [ ] Compare to Next.js baseline

4. **Security Testing**
   - [ ] Verify security headers
   - [ ] Run security scan (OWASP ZAP)
   - [ ] Test CSP compliance
   - [ ] Verify authentication works

#### Phase 5: UAT Deployment (Day 6)

1. **Deploy to UAT**
   ```bash
   gdu build --env uat
   cdk deploy pilot-app-uat
   ```

2. **UAT Testing**
   - [ ] Stakeholder testing
   - [ ] QA testing
   - [ ] Performance validation
   - [ ] Security validation

3. **Documentation**
   - [ ] Update migration guide with learnings
   - [ ] Document any issues encountered
   - [ ] Document performance results
   - [ ] Create migration report

### Example Route Migration

**Before (Next.js):**
```typescript
// pages/dashboard/index.tsx
import { GetServerSideProps } from 'next';
import { DashboardLayout } from '~/components/DashboardLayout';

interface Props {
  stats: DashboardStats;
  user: User;
}

const DashboardPage = ({ stats, user }: Props) => {
  return (
    <DashboardLayout user={user}>
      <h1>Dashboard</h1>
      <StatsCards stats={stats} />
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const user = await getUserFromRequest(req);
  const stats = await fetchDashboardStats(user.id);

  return {
    props: { stats, user },
  };
};

export default DashboardPage;
```

**After (React Router 7):**
```typescript
// app/routes/dashboard._index.tsx
import { useLoaderData } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { DashboardLayout } from '~/components/DashboardLayout';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromRequest(request);
  const stats = await fetchDashboardStats(user.id);

  return { stats, user };
}

export default function Dashboard() {
  const { stats, user } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout user={user}>
      <h1>Dashboard</h1>
      <StatsCards stats={stats} />
    </DashboardLayout>
  );
}
```

### Testing Strategy

#### Unit Tests
```typescript
// app/routes/__tests__/dashboard.test.tsx
import { createMemoryRouter, RouterProvider } from 'react-router';
import { render, screen } from '@testing-library/react';
import Dashboard, { loader } from '../dashboard._index';

describe('Dashboard', () => {
  it('renders dashboard stats', async () => {
    const data = await loader({
      request: new Request('http://localhost/dashboard'),
      params: {},
      context: {},
    });

    const router = createMemoryRouter([
      {
        path: '/',
        element: <Dashboard />,
        loader: () => data,
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

#### E2E Tests
```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard loads and displays stats', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page.locator('h1')).toContainText('Dashboard');
  await expect(page.locator('[data-testid="stats-card"]')).toBeVisible();
});
```

#### Performance Tests
```typescript
// performance/load-test.ts
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
  },
};

export default function () {
  const res = http.get('https://pilot-app-dev.autoguru.com.au/dashboard');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### Performance Baseline Comparison

| Metric | Next.js (Baseline) | React Router 7 (Target) | Actual |
|--------|-------------------|------------------------|--------|
| Dev build | 5s | < 5s | TBD |
| Prod build | 120s | < 120s | TBD |
| HMR | 500ms | < 100ms | TBD |
| Cold start | 2.5s | < 2s | TBD |
| SSR response (p95) | 450ms | < 500ms | TBD |
| Bundle size | 500KB | < 500KB | TBD |

### Migration Report Template

```markdown
# Pilot Migration Report: [App Name]

## Executive Summary
- Migration completed: [Date]
- Duration: [X] days
- Status: ✅ Success / ⚠️  Issues / ❌ Failed
- Recommendation: Proceed / Hold / Rollback

## Application Details
- Name: [App Name]
- Routes migrated: [X]
- Lines of code changed: [X]
- Tests updated: [X]

## Performance Results
[Table from above]

## Issues Encountered
1. **Issue 1**: [Description]
   - Impact: High / Medium / Low
   - Resolution: [How it was fixed]
   - Prevention: [How to avoid in future]

## Learnings
1. [Learning 1]
2. [Learning 2]

## Migration Guide Updates
- Added section on [X]
- Clarified [Y]
- Updated example for [Z]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps
- [ ] Deploy to production
- [ ] Migrate next application
- [ ] Update migration guide
- [ ] Share learnings with team
```

## UI/UX Specifications

### Visual Comparison
- Take screenshots of all pages in Next.js version
- Compare to React Router 7 version
- Verify pixel-perfect match (or document intentional changes)

### User Experience Validation
- Navigation feels instant (HMR benefit)
- Forms submit smoothly
- Loading states appear appropriately
- Error states are handled gracefully
- No visual regressions

## Test Scenarios

### Happy Path
1. Developer follows migration guide
2. Migrates pilot application successfully
3. All tests pass
4. Performance meets targets
5. Deploys to dev, then UAT
6. Stakeholders approve
7. Document learnings
8. Recommend broader rollout

### Issue Scenarios
1. **Build Fails**: Debug build configuration
2. **Tests Fail**: Update tests for React Router
3. **Performance Below Target**: Optimize bundle/SSR
4. **Security Issue**: Review headers and CSP
5. **Stakeholder Concerns**: Address feedback, iterate

## Definition of Done

### Development Complete
- [ ] Pilot app selected and documented
- [ ] All routes migrated to React Router 7
- [ ] All data fetching migrated to loaders
- [ ] All forms migrated to actions
- [ ] All tests updated and passing
- [ ] Build configuration working
- [ ] Lambda handler configured
- [ ] Code reviewed and approved

### Testing Complete
- [ ] Manual testing completed for all routes
- [ ] Automated tests passing (unit, integration, E2E)
- [ ] Performance benchmarks meet targets
- [ ] Security scan passed
- [ ] Accessibility audit passed
- [ ] Cross-browser testing completed
- [ ] Load testing passed

### Documentation Complete
- [ ] Migration process documented
- [ ] Issues and resolutions documented
- [ ] Performance results documented
- [ ] Migration guide updated with learnings
- [ ] Migration report created
- [ ] Team presentation delivered

### Deployment Ready
- [ ] Deployed to dev successfully
- [ ] Deployed to UAT successfully
- [ ] Stakeholder testing completed
- [ ] Sign-off obtained from stakeholders
- [ ] Rollback plan documented
- [ ] Monitoring and alarms configured

## Dependencies

### Blocked By
- AG-TBD-014: React Router config (need config to build)
- AG-TBD-015: Lambda integration (need handler to deploy)
- AG-TBD-016: Security headers (need headers in app)
- AG-TBD-017: CDK infrastructure (need infra to deploy)
- AG-TBD-018: Build manifest (nice to have)
- AG-TBD-019: Migration guide (need guide to follow)

### Blocks
- AG-TBD-021: Performance benchmarking (needs real app)
- Future migrations (need proof it works)

### Related Stories
- All previous stories in epic (uses all their work)

## Story Points Justification

**Complexity Factors**:
- **Frontend Complexity**: High
  - Migrate all routes
  - Migrate all data fetching
  - Migrate all forms
  - Update all tests
  - Verify functionality

- **Backend Complexity**: Medium
  - Configure Lambda handler
  - Set up CDK infrastructure
  - Configure environment variables

- **Testing Effort**: High
  - Manual testing all routes
  - Update all automated tests
  - Performance testing
  - Security testing
  - UAT testing

- **Deployment Complexity**: Medium
  - Deploy to dev
  - Deploy to UAT
  - Configure monitoring
  - Set up alarms

- **Documentation Effort**: Medium
  - Document process
  - Document issues
  - Create migration report
  - Update migration guide

- **Integration Points**: 8
  - React Router 7 config
  - Lambda handler
  - Security headers
  - CDK infrastructure
  - Build manifest
  - CloudFront
  - API Gateway
  - Monitoring

- **Unknown Factors**: High
  - First real migration, likely to encounter unexpected issues
  - May need to iterate on tooling
  - May need to update migration guide
  - Performance may require optimization

**Total Points**: 13

## Notes & Decisions

### Technical Decisions
- **Pilot app selection**: Choose non-critical app with moderate complexity
- **Feature branch**: Migrate in branch, not on main
- **Incremental approach**: Migrate route by route
- **Test continuously**: Test each route before moving to next
- **Document everything**: Capture all learnings

### Open Questions
- [ ] Which app should be the pilot?
- [ ] Should we do parallel deployment (Next.js + RR7)?
- [ ] How long should UAT period be?
- [ ] Who needs to sign off on production deployment?
- [ ] What's the rollback trigger threshold?

### Assumptions
- Pilot app has good test coverage
- Stakeholders are available for UAT
- Infrastructure is ready (CDK, Lambda, etc.)
- Team is available to support if issues arise

### Success Criteria
1. **Functional**: All features work as before
2. **Performance**: Meets or exceeds Next.js
3. **Quality**: No regressions (security, accessibility, UX)
4. **Stakeholder**: Approval to proceed
5. **Team**: Confidence in approach

### Risk Mitigation
- **Risk**: Unknown issues during migration
  - **Mitigation**: Choose simple app, document everything
- **Risk**: Performance doesn't meet targets
  - **Mitigation**: Benchmark early, optimize as needed
- **Risk**: Stakeholder doesn't approve
  - **Mitigation**: Involve stakeholders early, set expectations
- **Risk**: Production issues after deployment
  - **Mitigation**: Thorough testing, gradual rollout, rollback plan

### Files to Create/Modify

```
packages/pilot-app/
├── app/
│   ├── root.tsx                     # New: Root layout
│   └── routes/                      # New: All migrated routes
│       ├── _index.tsx
│       ├── dashboard._index.tsx
│       └── ...
├── react-router.config.ts           # New: RR7 config
├── guru.config.js                   # Modified: Keep same
└── package.json                     # Modified: Update deps

packages/pilot-app/__tests__/        # Modified: Update tests

mfe/infrastructure/                  # New: CDK stack for pilot
└── lib/stacks/pilot-app-stack.ts

docs/
└── migration-reports/               # New: Migration report
    └── pilot-app-report.md
```

### Post-Migration Checklist

- [ ] Application deployed to production
- [ ] Monitoring configured and working
- [ ] Alarms set up
- [ ] Team trained on React Router 7
- [ ] Migration guide finalized
- [ ] Lessons learned documented
- [ ] Next migration app identified
- [ ] Migration schedule created
