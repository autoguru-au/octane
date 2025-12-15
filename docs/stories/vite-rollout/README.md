# Vite Rollout Stories (Phase 3)

This directory contains detailed user stories for Phase 3 of the GDU Build Tooling Migration - the Vite rollout phase covering Sprints 4-6.

## Overview

Phase 3 focuses on migrating ~25 SPA applications from Webpack to Vite builds in a gradual, risk-managed approach. The rollout is structured in three sub-phases based on traffic levels and business criticality.

## Epic Context

**Epic**: AG-TBD - GDU Build Tooling Migration - Vite & React Router 7
**Phase**: Phase 3 - Vite Gradual Rollout
**Duration**: Sprints 4-6 (6 weeks)
**Prerequisites**: Phase 1 (Vite Foundation) and Phase 2 (Vite Pilot) completed

## Stories

### AG-TBD-011a: Create MFE Migration Playbook
**Sprint**: 4 | **Points**: 3 | **Priority**: Must Have

Create comprehensive migration playbook documenting step-by-step process, troubleshooting, and verification procedures for migrating MFEs to Vite.

**Key Deliverables**:
- Step-by-step migration checklist
- Common issues and solutions
- Troubleshooting decision tree
- Environment-specific instructions
- Rollback procedures
- Scripts and templates

**File**: [AG-TBD-011a-mfe-migration-playbook.md](./AG-TBD-011a-mfe-migration-playbook.md)

---

### AG-TBD-011: Migrate Low-Traffic SPAs to Vite (5 apps)
**Sprint**: 4 | **Points**: 13 | **Priority**: Should Have

Migrate 5 low-traffic/internal SPAs to Vite builds to validate the migration process at scale with minimal risk.

**Apps in Scope**:
1. aga-disbursements (Admin Disbursements)
2. gb-tenant (Global Portal Tenant)
3. gb-language-selector (Language Selector)
4. gb-support-contact (Support Contact)
5. fl-ha-review (FL HA Review)

**Key Activities**:
- Select low-traffic SPAs
- Follow migration playbook
- Test across all environments
- Monitor for 1 week post-migration
- Document learnings
- Validate rollback procedures

**Expected Outcomes**:
- Build time improvement: 60%+
- Bundle size reduction: 5-10%
- Zero production issues
- Playbook validated and refined

**File**: [AG-TBD-011-migrate-low-traffic-spas.md](./AG-TBD-011-migrate-low-traffic-spas.md)

---

### AG-TBD-012: Migrate Medium-Traffic SPAs to Vite (10 apps)
**Sprint**: 5 | **Points**: 21 | **Priority**: Should Have

Migrate 10 medium-traffic SPAs including customer-facing B2C features and supplier/fleet portal components.

**Apps in Scope**:

**Supplier Portal** (4 apps):
1. sp-pricing
2. sp-account-pricing-settings
3. sp-resource
4. sp-guide

**Fleet Portal** (3 apps):
5. fcp-portfolio
6. fcp-account
7. fcp-users

**B2C Consumer** (2 apps):
8. homepage
9. mg-home

**Fleet Management Ops** (1 app):
10. fmo-portfolio

**Key Activities**:
- Coordinate with owning teams
- Pre-migration meetings and planning
- Comprehensive testing (unit, integration, E2E)
- UAT with product owners
- Canary deployments for higher-traffic apps
- Extended monitoring (1 week per app)
- Enhanced New Relic dashboards

**Expected Outcomes**:
- Build time improvement: 60-65%
- Bundle size maintained or reduced
- Zero customer-impacting incidents
- Increased stakeholder confidence

**File**: [AG-TBD-012-migrate-medium-traffic-spas.md](./AG-TBD-012-migrate-medium-traffic-spas.md)

---

### AG-TBD-013: Migrate High-Traffic SPAs to Vite (10 apps)
**Sprint**: 6 | **Points**: 13 | **Priority**: Should Have

Migrate remaining high-traffic SPAs including critical booking flows, marketplace components, and app shells. This completes the SPA migration.

**Apps in Scope**:

**B2C Marketplace - Booking Flow**:
1. mg-booking (My Garage Booking) - Primary B2C revenue driver
2. cb-portal (Customer Booking Portal)

**Supplier Portal - Job Management**:
3. sp-booking (Supplier Portal Booking)
4. sp-job (Supplier Portal Jobs) - Highest traffic SPA
5. sp-dashboard (Supplier Dashboard)

**Fleet Portal - Booking & Operations**:
6. fcp-booking (Fleet Client Portal Booking)
7. fmo-booking (Fleet Portal Booking)

**App Shells** (Critical Infrastructure):
8. sp-app-shell (Supplier Portal App Shell)
9. fcp-app-shell (Fleet Client Portal App Shell)
10. fmo-app-shell (Fleet Portal App Shell)

**Key Activities**:
- Executive stakeholder communication
- Canary deployments (10% → 50% → 100%)
- Real-time business metrics monitoring
- Load testing for booking flows
- Payment integration validation
- 24/7 monitoring during migrations
- Extended monitoring (2 weeks per app)
- Business metric tracking (conversion rates, revenue)

**Expected Outcomes**:
- Build time improvement: 50-70%
- Zero revenue impact
- Conversion rates maintained (>98% baseline)
- Zero critical incidents
- **100% of SPA estate on Vite builds** ✅

**File**: [AG-TBD-013-migrate-high-traffic-spas.md](./AG-TBD-013-migrate-high-traffic-spas.md)

---

## Migration Approach

### Risk-Based Phasing

```
Phase 3.1 (Sprint 4): Low-Traffic SPAs
├─ 5 apps
├─ Internal tools and low-traffic features
├─ Minimal business risk
└─ Validates playbook at scale

Phase 3.2 (Sprint 5): Medium-Traffic SPAs
├─ 10 apps
├─ Customer-facing features
├─ Moderate business impact
└─ Tests coordination at scale

Phase 3.3 (Sprint 6): High-Traffic SPAs
├─ 10 apps
├─ Critical booking flows
├─ Highest business impact
└─ Completes SPA migration
```

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| SPAs migrated | 25/25 (100%) | All SPAs on Vite |
| Build time improvement | 50-70% | CI/CD analytics |
| Production incidents | 0 critical | New Relic, incident tracking |
| Bundle size change | ≤5% increase | Build output comparison |
| Test pass rate | 100% | CI/CD test results |
| Business metrics | No degradation | Conversion rates, revenue |
| Developer satisfaction | Positive | Survey feedback |

### Key Principles

1. **Gradual Rollout**: Progress from low to high risk
2. **Proven Process**: Use validated playbook for consistency
3. **Comprehensive Testing**: No shortcuts on quality
4. **Stakeholder Coordination**: Clear communication with teams
5. **Monitoring First**: Observe before proceeding
6. **Rollback Ready**: Instant revert capability
7. **Business Focus**: Protect revenue and customer experience

## Total Scope

**Stories**: 4 (1 playbook + 3 migration phases)
**Story Points**: 50 total
**Duration**: 3 sprints (6 weeks)
**SPAs Migrated**: 25 applications
**Deployments**: ~175 (25 apps × 7 environments)
**Teams Involved**: 10+ engineering teams
**Users Impacted**: 50,000+ daily active users

## Dependencies

### Prerequisites (Must be complete before Phase 3)
- ✅ AG-TBD-001 to AG-TBD-007: Vite foundation stories
- ✅ AG-TBD-008: Pilot SPA migration
- ✅ AG-TBD-009: Build comparison tooling
- ✅ AG-TBD-010: Performance benchmarking suite

### Enables (Can begin after Phase 3)
- AG-TBD-027: Documentation and training
- AG-TBD-028: Webpack deprecation plan
- React Router 7 migration phases

## Key Files & Resources

### Documentation
- Migration playbook: `packages/gdu/docs/migration-guides/webpack-to-vite-mfe-playbook.md`
- Troubleshooting guide: Included in playbook
- Performance benchmarks: Collected during migrations

### Tools
- Build comparison script: Used for validation
- Performance testing suite: Validates improvements
- New Relic dashboards: Monitors production health

### Communication
- Weekly status updates: Shared in #platform-engineering
- Team-specific notifications: Per-app migration announcements
- Executive summaries: Leadership updates

## Risk Management

### High-Risk Applications
- mg-booking: Primary B2C revenue driver
- sp-job: Highest traffic (20,000+ DAU)
- sp-booking: Core supplier workflow
- All app shells: Critical infrastructure

### Mitigation Strategies
- Canary deployments for high-traffic apps
- Extended monitoring periods (2 weeks)
- Real-time business metrics tracking
- Automatic rollback triggers
- 24/7 on-call coverage
- Executive approval gates

### Rollback Capability
- Instant rollback (<5 minutes)
- Automated rollback triggers
- Tested rollback procedures
- Clear escalation paths

## Success Criteria

### Technical Success
- [x] All 25 SPAs building with Vite
- [x] Build time improvements ≥50%
- [x] Zero functionality regressions
- [x] All tests passing (100%)
- [x] Bundle sizes maintained or reduced

### Business Success
- [x] Zero critical production incidents
- [x] Business metrics maintained
- [x] Customer experience unchanged or improved
- [x] Stakeholder confidence high

### Process Success
- [x] Playbook validated and comprehensive
- [x] Teams trained and confident
- [x] Migration process efficient
- [x] Learnings documented and shared

## Timeline

```
Sprint 4 (Weeks 1-2):
├─ Week 1: Create playbook, prepare for migrations
└─ Week 2: Migrate 5 low-traffic SPAs

Sprint 5 (Weeks 3-4):
├─ Week 1: Migrate first 5 medium-traffic SPAs
└─ Week 2: Migrate remaining 5 medium-traffic SPAs

Sprint 6 (Weeks 5-6):
├─ Week 1: Migrate app shells + supplier apps
├─ Week 2: Migrate fleet apps
└─ Week 3: Migrate B2C booking flows
```

## Next Steps

After Phase 3 completion:
1. Create final migration report
2. Update GDU documentation
3. Conduct team retrospective
4. Share learnings with broader engineering
5. Plan webpack deprecation timeline
6. Begin React Router 7 migration (Phase 4)

---

**Phase Owner**: Platform Team Lead
**Created**: 2025-12-15
**Status**: Ready for Execution
**Success Criteria**: 100% SPA migration to Vite with zero production incidents

For questions or clarification, contact the Platform Team via #platform-engineering.
