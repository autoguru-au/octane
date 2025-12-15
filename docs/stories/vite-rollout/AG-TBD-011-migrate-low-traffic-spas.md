# Story: PM. Build Tooling. As a Platform Engineer, I want to migrate 5 low-traffic SPAs to Vite builds, so that we can validate the migration process at scale with minimal risk

## Story Details

**Story ID**: AG-TBD-011
**Epic**: AG-TBD - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Should Have
**Story Points**: 13
**Sprint**: 4

## Description

### Summary

G'day! Now that we've validated Vite works with our pilot migration and have a comprehensive migration playbook, it's time to scale up the migration effort. This story covers migrating 5 low-traffic or internal SPA applications to Vite builds, allowing us to test the migration process at a larger scale while minimizing risk to critical user-facing features.

These low-traffic SPAs are perfect candidates for this phase because they have fewer users, lower business criticality, and any issues discovered will have limited blast radius. We'll use the migration playbook, collect metrics, document any new issues, and validate that our process works consistently across different applications.

### Background

We've completed the pilot migration and created a comprehensive playbook. Now we need to prove the process works at scale. Starting with low-traffic apps gives us the opportunity to refine the playbook, identify edge cases, and build confidence before tackling higher-traffic applications.

Low-traffic SPAs typically include internal tools, admin panels, and secondary features that have lower usage but are still important to the business. These are ideal for learning and iteration.

### User Value

Platform engineers will validate the migration process works consistently across multiple applications, while developers of these SPAs will benefit from faster build times and improved CI/CD performance. The business benefits from reduced infrastructure costs and faster deployment cycles.

## User Persona

**Role**: Platform Engineer
**Name**: "Alex the Platform Engineer"
**Context**: Responsible for executing the Vite migration rollout plan
**Goals**: Successfully migrate multiple SPAs, gather learnings, ensure zero regressions
**Pain Points**: Uncertainty about edge cases, fear of production issues, time pressure to complete migrations

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | 5 low-traffic SPAs selected based on criteria (traffic, criticality, complexity) | ☐ | ☐ | ☐ |
| 2 | Each SPA builds successfully with Vite across all environments (dev, test, uat, preprod, prod, dockerprod, shared) | ☐ | ☐ | ☐ |
| 3 | Build manifests for each SPA match expected structure and content | ☐ | ☐ | ☐ |
| 4 | Translation files hashed correctly for multi-tenant SPAs | ☐ | ☐ | ☐ |
| 5 | Each SPA loads and functions correctly in all environments | ☐ | ☐ | ☐ |
| 6 | All existing unit tests pass for each SPA | ☐ | ☐ | ☐ |
| 7 | All existing E2E tests pass for each SPA | ☐ | ☐ | ☐ |
| 8 | CI/CD pipelines updated and working for all 5 SPAs | ☐ | ☐ | ☐ |
| 9 | Production deployments successful for all 5 SPAs | ☐ | ☐ | ☐ |
| 10 | No critical issues reported during 1 week monitoring period | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Build time improved by at least 50% for each SPA | ☐ | ☐ | ☐ |
| 2 | Bundle sizes remain same or smaller than webpack builds | ☐ | ☐ | ☐ |
| 3 | Zero regression in page load performance (measured via New Relic) | ☐ | ☐ | ☐ |
| 4 | All SPAs accessible via keyboard navigation (no accessibility regressions) | ☐ | ☐ | ☐ |
| 5 | No console errors in browser after deployment | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | SPAs with custom webpack plugins migrated successfully (or plugins adapted) | ☐ | ☐ | ☐ |
| 2 | Multi-tenanted SPAs build correctly for all tenants (au, nz, global) | ☐ | ☐ | ☐ |
| 3 | Standalone vs non-standalone SPAs both work correctly | ☐ | ☐ | ☐ |
| 4 | Rollback executed successfully for at least 1 SPA (validation test) | ☐ | ☐ | ☐ |

## Technical Implementation

### SPA Selection Criteria

**Low-Traffic SPA Candidates** (from ~83 total MFE apps):

1. **aga-disbursements** (AutoGuru Admin Disbursements)
   - Type: SPA, Internal admin tool
   - Traffic: Very low (internal only)
   - Criticality: Medium (financial operations)
   - Complexity: Low-medium

2. **gb-tenant** (Global Portal Tenant)
   - Type: SPA, Internal tenant management
   - Traffic: Low (admin operations)
   - Criticality: Medium
   - Complexity: Low

3. **gb-language-selector** (Global Portal Language Selector)
   - Type: SPA, UI component
   - Traffic: Low
   - Criticality: Low
   - Complexity: Low

4. **gb-support-contact** (Global Portal Support)
   - Type: SPA, Support widget
   - Traffic: Low-medium
   - Criticality: Medium
   - Complexity: Low

5. **fl-ha-review** (FL HA Review)
   - Type: SPA, Internal review tool
   - Traffic: Low (internal)
   - Criticality: Low
   - Complexity: Low

**Selection Rationale**:
- All have low traffic (limited blast radius)
- Mix of internal tools and minor user-facing features
- Varying complexity levels to test playbook comprehensiveness
- Include multi-tenant capabilities (gb- apps are global)
- No critical business flows (safe to iterate)

### Migration Process Per SPA

#### Phase 1: Pre-Migration (30 minutes per SPA)

```bash
# 1. Verify current state
cd /Users/amirzahedi/Documents/GitHub/mfe/apps/[app-name]

# 2. Document baseline
gdu build --bundler webpack
# Record build time, bundle size, manifest structure

# 3. Run tests
yarn test
yarn test:e2e

# 4. Document metrics
# - Build time
# - Bundle size
# - Test coverage
# - Current GDU version
```

#### Phase 2: Local Migration (1 hour per SPA)

```bash
# 1. Update to latest GDU (if needed)
yarn upgrade gdu@latest

# 2. Test Vite build locally
gdu build --bundler vite

# 3. Compare outputs
./scripts/compare-builds.sh

# 4. Manual testing
# - Start app locally
# - Test key functionality
# - Check browser console
# - Validate translations (if multi-tenant)

# 5. Run test suite
yarn test
yarn test:e2e
```

#### Phase 3: CI/CD Update (30 minutes per SPA)

```yaml
# Update .github/workflows/build.yml or equivalent
# Change build command from:
- run: gdu build

# To:
- run: gdu build --bundler vite
```

#### Phase 4: Environment Rollout (2-3 days per SPA)

```bash
# Day 1: dev + test
# Deploy to dev, validate
# Deploy to test, QA validation

# Day 2: uat + preprod
# Deploy to uat, stakeholder validation
# Deploy to preprod, production readiness check

# Day 3: prod
# Deploy to production
# Monitor for 24 hours
# Collect metrics
```

### Monitoring & Validation

#### Build Metrics Collection

```typescript
interface BuildMetrics {
  appName: string;
  bundler: 'webpack' | 'vite';
  environment: string;
  buildTime: number; // seconds
  bundleSize: number; // bytes
  chunkCount: number;
  timestamp: Date;
}

// Collect for each build
const metrics: BuildMetrics[] = [
  {
    appName: 'aga-disbursements',
    bundler: 'webpack',
    environment: 'prod',
    buildTime: 180, // 3 min
    bundleSize: 450000, // 450 KB
    chunkCount: 8,
    timestamp: new Date('2025-12-15'),
  },
  {
    appName: 'aga-disbursements',
    bundler: 'vite',
    environment: 'prod',
    buildTime: 60, // 1 min
    bundleSize: 430000, // 430 KB
    chunkCount: 7,
    timestamp: new Date('2025-12-16'),
  },
  // ... repeat for all 5 SPAs
];
```

#### Runtime Monitoring

```bash
# New Relic queries for monitoring
# Page load times
SELECT average(duration) FROM PageView
WHERE appName = 'aga-disbursements'
SINCE 1 week ago
FACET releaseId

# JavaScript errors
SELECT count(*) FROM JavaScriptError
WHERE appName = 'aga-disbursements'
SINCE 1 week ago
FACET errorMessage

# Performance metrics
SELECT percentile(pageRenderingDuration, 95)
FROM PageView
WHERE appName = 'aga-disbursements'
SINCE 1 week ago
```

### Issue Tracking

Create tracking document for lessons learned:

```markdown
## Migration Learnings: [APP-NAME]

**Date**: YYYY-MM-DD
**Engineer**: [Name]

### Issues Encountered
1. Issue description
   - Root cause
   - Solution applied
   - Time to resolve
   - Playbook update needed? Y/N

### Performance Improvements
- Build time: X min → Y min (Z% improvement)
- Bundle size: X KB → Y KB (Z% change)
- CI/CD time: X min → Y min (Z% improvement)

### Recommendations
- Update playbook with: [specific additions]
- Consider for future migrations: [insights]
```

### Rollback Testing

Test rollback procedure on one SPA:

```bash
# Rollback test (choose gb-language-selector for minimal impact)
# 1. Deploy Vite build to preprod
# 2. Intentionally trigger rollback
# 3. Revert CI/CD to webpack
# 4. Verify webpack build works
# 5. Validate rollback procedure timing
# 6. Document any issues
```

## Testing Requirements

### Per-SPA Testing Checklist

#### Unit Tests
- [ ] All existing unit tests pass with Vite build
- [ ] Code coverage maintained or improved
- [ ] No new test failures introduced
- [ ] Test execution time similar or faster

#### Integration Tests
- [ ] API integration tests pass
- [ ] Relay/GraphQL queries work correctly
- [ ] Multi-tenant routing works (if applicable)
- [ ] Build manifest structure correct

#### E2E Tests
- [ ] All existing E2E tests pass
- [ ] User flows complete successfully
- [ ] No visual regressions
- [ ] Multi-browser testing (Chrome, Safari, Firefox)

#### Manual Testing
- [ ] App loads without errors
- [ ] Navigation works correctly
- [ ] Forms submit successfully
- [ ] Data displays correctly
- [ ] Translations load (if multi-tenant)
- [ ] Authentication/authorization works
- [ ] No console errors or warnings

#### Performance Testing
- [ ] Page load time measured (baseline vs new)
- [ ] Time to interactive measured
- [ ] Bundle size compared
- [ ] Network waterfall analyzed
- [ ] No performance regressions

### Acceptance Testing

```markdown
## Acceptance Test Plan: [APP-NAME]

### Environment: Production
### Date: YYYY-MM-DD
### Tester: [Name]

#### Functional Tests
- [ ] Navigate to app at [URL]
- [ ] Login (if authenticated)
- [ ] Complete primary user flow
- [ ] Verify data displays correctly
- [ ] Test search/filter (if applicable)
- [ ] Test form submission (if applicable)
- [ ] Logout (if authenticated)

#### Non-Functional Tests
- [ ] Page loads within 3 seconds
- [ ] No JavaScript errors in console
- [ ] Accessible via keyboard
- [ ] Works on mobile viewport
- [ ] Works in Safari, Chrome, Firefox
- [ ] Network requests successful
- [ ] Translations correct (if multi-tenant)

#### Sign-off
- [ ] QA approval
- [ ] Product owner approval (if needed)
- [ ] Platform team approval
```

## Communication Plan

### Stakeholders

**Primary**:
- Platform engineering team (executing migrations)
- Developers of the 5 SPAs being migrated
- QA team (testing)
- DevOps team (CI/CD support)

**Secondary**:
- Product owners of affected SPAs
- Support team (for potential issues)
- End users (minimal impact expected)

### Communication Timeline

**Week Before Migration**:
```
To: Engineering team
Subject: Vite Migration - Low-Traffic SPAs (Week of [Date])

G'day team,

Next week we're kicking off the Vite rollout by migrating 5 low-traffic SPAs:
- aga-disbursements
- gb-tenant
- gb-language-selector
- gb-support-contact
- fl-ha-review

What this means:
✅ Faster build times (50%+ improvement expected)
✅ Improved CI/CD performance
✅ No changes to functionality
⚠️ Potential for build-related issues (we'll monitor closely)

If you work on any of these apps, please:
1. Avoid major changes during migration week
2. Report any unusual behavior immediately
3. Contact #platform-engineering with questions

Migration schedule: [Link to detailed schedule]
Playbook: [Link to playbook]

Cheers,
Platform Team
```

**During Migration** (Daily Updates):
```
#platform-engineering Slack channel

Daily Update: Vite Migration - Day [X]

Today's Progress:
✅ aga-disbursements - Deployed to prod, monitoring
🚧 gb-tenant - In UAT validation
📋 gb-language-selector - Next up

Metrics:
- Build time improvements: 60% average
- Bundle size: 5% smaller average
- Issues encountered: 2 (both resolved)

Tomorrow's Plan:
- Complete gb-tenant prod deployment
- Start gb-language-selector dev deployment

Issues/Blockers: None
```

**After Migration** (Summary):
```
To: Engineering team, Leadership
Subject: Vite Migration Phase 1 Complete - Results & Learnings

G'day,

Phase 1 of our Vite migration is complete! We've successfully migrated 5 low-traffic SPAs to Vite builds.

📊 Results:
- All 5 SPAs migrated successfully
- Average build time improvement: 65%
- Average bundle size reduction: 8%
- Zero production issues reported
- Zero functionality regressions

🎯 SPAs Migrated:
✅ aga-disbursements
✅ gb-tenant
✅ gb-language-selector
✅ gb-support-contact
✅ fl-ha-review

📚 Learnings:
- [Key learning 1]
- [Key learning 2]
- Playbook updated with 3 new edge cases

🚀 Next Steps:
- Phase 2: Migrate 10 medium-traffic SPAs (Sprint 5)
- Continued monitoring of migrated apps
- Playbook refinements based on learnings

Detailed metrics: [Link to dashboard]
Updated playbook: [Link]

Questions? Hit us up in #platform-engineering

Cheers,
Platform Team
```

### Escalation Path

**Level 1** (Build Issues):
- Platform engineer troubleshoots using playbook
- Consult with peer platform engineer
- Check GDU documentation

**Level 2** (Deployment Issues):
- Escalate to Platform Team Lead
- Engage DevOps team
- Consider rollback if blocking

**Level 3** (Production Issues):
- Immediate rollback
- Escalate to Engineering Manager
- Notify Product Owner
- Post-incident review scheduled

## Rollback Plan

### Rollback Triggers

Initiate rollback if:
- Critical production errors occur
- User-facing functionality broken
- Performance degradation >20%
- Build failures in CI/CD
- Unable to resolve issues within 4 hours

### Rollback Procedure

#### Immediate Rollback (< 15 minutes)

```bash
# 1. Revert CI/CD configuration
cd /Users/amirzahedi/Documents/GitHub/mfe/apps/[app-name]
git revert [vite-migration-commit]
git push origin main

# 2. Trigger rebuild with webpack
# CI/CD will automatically build with webpack

# 3. Verify deployment
# Check New Relic for successful deployment
# Smoke test production app

# 4. Notify team
# Post in #platform-engineering
# Update migration tracker
```

#### Post-Rollback Actions

1. Document rollback reason and details
2. Create incident report
3. Analyze root cause
4. Update playbook if needed
5. Plan remediation
6. Schedule retry (if appropriate)

### Rollback Testing

Before production migrations, validate rollback:

```markdown
## Rollback Validation Test

**App**: gb-language-selector (lowest risk)
**Environment**: preprod
**Date**: [Date]

### Test Steps
1. Deploy Vite build to preprod
2. Verify functioning correctly
3. Trigger rollback to webpack
4. Verify webpack build succeeds
5. Verify app still functioning
6. Measure rollback time

### Results
- Rollback time: [X minutes]
- Issues encountered: [None or list]
- Rollback procedure effective: Y/N
- Playbook updates needed: Y/N
```

## Definition of Done

### Development Complete
- [ ] All 5 SPAs selected and documented
- [ ] Migration playbook followed for each SPA
- [ ] Local builds successful for all 5 SPAs
- [ ] CI/CD pipelines updated for all 5 SPAs
- [ ] All code changes committed and reviewed

### Testing Complete
- [ ] Unit tests passing for all 5 SPAs
- [ ] Integration tests passing for all 5 SPAs
- [ ] E2E tests passing for all 5 SPAs
- [ ] Manual testing completed for all 5 SPAs
- [ ] Performance validation completed
- [ ] Accessibility validation completed
- [ ] Cross-browser testing completed

### Deployment Complete
- [ ] All 5 SPAs deployed to dev
- [ ] All 5 SPAs deployed to test
- [ ] All 5 SPAs deployed to uat
- [ ] All 5 SPAs deployed to preprod
- [ ] All 5 SPAs deployed to prod
- [ ] All 5 SPAs deployed to dockerprod
- [ ] All 5 SPAs deployed to shared (if applicable)

### Monitoring Complete
- [ ] Production monitoring active for 1 week
- [ ] No critical issues reported
- [ ] Performance metrics collected
- [ ] User feedback collected (if applicable)
- [ ] New Relic dashboards showing healthy metrics

### Documentation Complete
- [ ] Migration tracking spreadsheet updated
- [ ] Build metrics documented for each SPA
- [ ] Issues/learnings documented
- [ ] Playbook updated with new learnings
- [ ] Team notified of completion
- [ ] Summary report created and shared

## Dependencies

### Blocked By
- AG-TBD-011a: MFE migration playbook (must be complete)
- AG-TBD-001 to AG-TBD-007: Vite foundation (must be production-ready)
- AG-TBD-008: Pilot SPA migration (must be successful)
- AG-TBD-009: Build comparison tooling (must be available)

### Blocks
- AG-TBD-012: Migrate medium-traffic SPAs (depends on learnings from this story)

### Related Stories
- AG-TBD-010: Performance benchmarking suite (used for validation)
- AG-TBD-012: Migrate medium-traffic SPAs (next phase)
- AG-TBD-013: Migrate high-traffic SPAs (future phase)

## Story Points Justification

**Complexity Factors**:
- **Migration Execution**: High
  - 5 separate SPAs to migrate
  - Multiple environments per SPA (7 environments)
  - Testing and validation for each
  - Total: ~35 deployments
- **Testing Effort**: High
  - Comprehensive testing per SPA
  - E2E tests, performance tests, manual tests
  - Multi-environment validation
- **Coordination**: Medium
  - Stakeholder communication
  - QA coordination
  - DevOps collaboration
- **Risk Management**: Medium
  - Monitoring and issue resolution
  - Potential rollbacks
  - Documentation of learnings

**Time Estimate**:
- Pre-migration: 0.5 day per SPA = 2.5 days
- Migration execution: 1 day per SPA = 5 days
- Testing & validation: 0.5 day per SPA = 2.5 days
- Deployment & monitoring: 1 week collective
- Documentation: 1 day
- **Total**: ~2-2.5 weeks (with parallelization)

**Total Points**: 13

## Notes & Decisions

### Technical Decisions
- **SPA Selection**: Chose mix of internal tools and low-traffic features to minimize risk while testing variety
- **Rollback Testing**: Include rollback validation as part of this story to ensure safety net works
- **Monitoring Period**: 1 week minimum per SPA before considering successful
- **Parallelization**: Migrate SPAs sequentially (not parallel) to manage risk and learn iteratively

### Open Questions
- [ ] Should we include CSS-in-JS libraries testing with these SPAs?
- [ ] Do we need product owner sign-off for internal tools?
- [ ] Should we extend monitoring period if any minor issues found?
- [ ] Should we create automated comparison between webpack and Vite outputs?

### Assumptions
- Migration playbook is comprehensive and tested
- GDU Vite implementation is production-ready
- Build comparison tooling is available
- CI/CD pipelines support both webpack and Vite
- Rollback capability has been tested
- Low-traffic SPAs have <1000 daily active users
- Internal tools have flexible deployment windows

### Success Criteria
- All 5 SPAs migrated within sprint 4 (2 weeks)
- Zero critical production issues
- Build time improvements of 50%+ achieved
- Playbook validated and refined
- Team confidence in migration process increased
- Ready to scale to medium-traffic SPAs in sprint 5

---

**Story Owner**: Platform Team Lead
**Created**: 2025-12-15
**Last Updated**: 2025-12-15
**Status**: Ready for Development
