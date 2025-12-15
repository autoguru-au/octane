# Story: PM. Build Tooling. As a Platform Engineer, I want a comprehensive MFE migration playbook, so that I can systematically migrate applications to Vite with confidence

## Story Details

**Story ID**: AG-TBD-011a
**Epic**: AG-TBD - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 3
**Sprint**: 4

## Description

### Summary

Before we start migrating our ~20+ SPA applications to Vite, we need a detailed playbook that documents the step-by-step migration process, common issues, troubleshooting steps, and verification procedures. This playbook will serve as the authoritative guide for platform engineers and developers performing migrations, ensuring consistency, reducing errors, and speeding up the migration process.

The playbook should be practical, actionable, and based on learnings from the pilot migration (AG-TBD-008). It'll include scripts, checklists, and commands that can be copy-pasted, making the migration process as smooth as possible.

### Background

We've successfully completed the pilot migration and validated the Vite build system works correctly. Now we're entering the rollout phase where we need to migrate dozens of MFE applications. Without clear documentation, each migration would require figuring out the same steps repeatedly, leading to inconsistency and potential errors.

### User Value

Platform engineers and developers will have a reliable, tested guide that reduces migration time from potentially hours to minutes, ensures consistency across all migrations, and provides quick solutions to common issues.

## User Persona

**Role**: Platform Engineer
**Name**: "Alex the Platform Engineer"
**Context**: Responsible for migrating multiple MFE applications to Vite builds
**Goals**: Complete migrations quickly, ensure zero regressions, maintain system stability
**Pain Points**: Uncertainty about migration steps, fear of breaking production, time wasted debugging the same issues

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Playbook includes step-by-step migration checklist with exact commands | ☐ | ☐ | ☐ |
| 2 | Pre-migration verification steps documented (dependencies, configuration) | ☐ | ☐ | ☐ |
| 3 | Migration execution steps include all required configuration changes | ☐ | ☐ | ☐ |
| 4 | Post-migration validation steps verify build outputs and runtime functionality | ☐ | ☐ | ☐ |
| 5 | Environment-specific migration instructions for all environments (dev, test, uat, preprod, prod, dockerprod, shared) | ☐ | ☐ | ☐ |
| 6 | Rollback procedure documented with exact steps to revert to webpack | ☐ | ☐ | ☐ |
| 7 | Common issues section includes at least 10 known issues with solutions | ☐ | ☐ | ☐ |
| 8 | Troubleshooting decision tree helps diagnose build failures | ☐ | ☐ | ☐ |
| 9 | Build output comparison guide explains how to verify manifest correctness | ☐ | ☐ | ☐ |
| 10 | Performance validation section includes benchmarking commands | ☐ | ☐ | ☐ |

### Non-Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Playbook is written in markdown and stored in GDU repository | ☐ | ☐ | ☐ |
| 2 | All commands are tested and verified to work correctly | ☐ | ☐ | ☐ |
| 3 | Playbook is reviewed and approved by at least 2 platform engineers | ☐ | ☐ | ☐ |
| 4 | Documentation uses conversational Australian English tone | ☐ | ☐ | ☐ |

### Edge Cases

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Instructions for MFEs with custom webpack plugins documented | ☐ | ☐ | ☐ |
| 2 | Guidance for multi-tenanted applications included | ☐ | ☐ | ☐ |
| 3 | Special cases for apps using deprecated GDU features addressed | ☐ | ☐ | ☐ |

## Technical Implementation

### Documentation Structure

#### File Location
```
packages/gdu/docs/migration-guides/
└── webpack-to-vite-mfe-playbook.md
```

#### Playbook Sections

1. **Overview**
   - Purpose of migration
   - Prerequisites
   - Required tools and access
   - Estimated time per migration

2. **Pre-Migration Checklist**
   - Verify current webpack build is working
   - Check GDU version compatibility
   - Review guru.config.js settings
   - Identify custom webpack plugins/hooks
   - Document baseline performance metrics

3. **Migration Steps**
   - Step 1: Update local environment
   - Step 2: Test Vite build locally
   - Step 3: Compare build outputs
   - Step 4: Update CI/CD configuration
   - Step 5: Deploy to dev environment
   - Step 6: Validate dev deployment
   - Step 7: Progressive environment rollout
   - Step 8: Production deployment
   - Step 9: Post-deployment monitoring

4. **Environment-Specific Instructions**
   - `dev`: Local and development testing
   - `test`: QA validation procedures
   - `uat`: Stakeholder acceptance steps
   - `preprod`: Production readiness checks
   - `prod`: Production deployment protocol
   - `dockerprod`: Docker-based production builds
   - `shared`: Shared environment considerations

5. **Verification Procedures**
   - Build manifest comparison
   - Translation file verification
   - Asset hashing validation
   - Runtime MFE loading tests
   - E2E test execution
   - Performance benchmarking

6. **Rollback Procedure**
   - When to rollback (failure criteria)
   - How to revert CI/CD changes
   - How to revert configuration
   - How to notify stakeholders
   - Post-rollback actions

7. **Common Issues & Solutions**
   - Build failures and resolutions
   - ESM.sh externals not loading
   - Translation hashing mismatches
   - Public path tokenization issues
   - Chunk naming differences
   - Source map problems
   - Bundle size increases
   - Cache invalidation issues
   - Module resolution errors
   - CSS loading failures

8. **Troubleshooting Guide**
   - Debugging build failures
   - Inspecting build output
   - Comparing webpack vs vite outputs
   - Using build comparison tool
   - Enabling verbose logging
   - Analyzing bundle contents

9. **Testing Checklist**
   - Unit tests passing
   - Integration tests passing
   - E2E tests passing
   - Visual regression tests
   - Performance tests
   - Multi-environment tests
   - Multi-tenant tests

10. **Communication Templates**
    - Migration announcement template
    - Progress update template
    - Issue escalation template
    - Completion notification template

### Example Checklist Template

```markdown
## Migration Checklist: [MFE-NAME]

**Migration Date**: YYYY-MM-DD
**Engineer**: [Name]
**App**: [app-name]
**Type**: SPA
**Traffic Level**: Low | Medium | High

### Pre-Migration
- [ ] Current webpack build verified working
- [ ] GDU version: [version]
- [ ] guru.config.js reviewed
- [ ] Custom plugins identified: [list or none]
- [ ] Baseline build time: [X minutes]
- [ ] Baseline bundle size: [X KB]
- [ ] All tests passing on main branch

### Local Testing
- [ ] Ran `gdu build --bundler vite` successfully
- [ ] Build manifest generated correctly
- [ ] Translation files hashed correctly
- [ ] Build time improved to: [X minutes]
- [ ] Bundle size: [X KB]
- [ ] Manual testing completed
- [ ] No console errors in browser

### Build Comparison
- [ ] Build manifest structure identical
- [ ] Translation hashes match expected pattern
- [ ] Asset paths correct
- [ ] Chunk names appropriate
- [ ] Source maps generated

### CI/CD Update
- [ ] Updated build command in CI config
- [ ] Verified build succeeds in CI
- [ ] Artifact upload working
- [ ] Deployment to dev successful

### Environment Rollout
- [ ] dev: Deployed and validated
- [ ] test: QA sign-off received
- [ ] uat: Stakeholder acceptance received
- [ ] preprod: Production readiness confirmed
- [ ] prod: Deployed successfully
- [ ] Monitoring for 24 hours - no issues

### Post-Migration
- [ ] Performance metrics collected
- [ ] Build time improvement: [X%]
- [ ] Bundle size change: [X%]
- [ ] Team notified of completion
- [ ] Lessons learned documented

### Rollback (if needed)
- [ ] Reverted CI/CD configuration
- [ ] Reverted to webpack build
- [ ] Validated rollback successful
- [ ] Incident documented
```

### Common Issues Section Examples

```markdown
## Common Issues & Solutions

### Issue 1: Build fails with "Cannot find module" error

**Symptom**: Vite build fails with module resolution error
**Cause**: Vite handles module resolution differently than webpack
**Solution**:
1. Check if using webpack-specific aliases
2. Update tsconfig.json paths if needed
3. Use Vite's resolve.alias configuration
```

```markdown
### Issue 2: ESM.sh externals not loading in browser

**Symptom**: React/ReactDOM loading errors in browser console
**Cause**: External configuration mismatch
**Solution**:
1. Verify rollupOptions.external includes react, react-dom
2. Check CDN URLs in index.html
3. Ensure version pinning matches package.json
```

### Scripts to Include

```bash
# Build comparison script
#!/bin/bash
echo "Building with webpack..."
gdu build --bundler webpack
cp dist/build-manifest.json dist/webpack-manifest.json

echo "Building with Vite..."
gdu build --bundler vite
cp dist/build-manifest.json dist/vite-manifest.json

echo "Comparing manifests..."
diff -u dist/webpack-manifest.json dist/vite-manifest.json
```

```bash
# Performance benchmarking script
#!/bin/bash
echo "Benchmarking webpack build..."
time gdu build --bundler webpack

echo "Benchmarking Vite build..."
time gdu build --bundler vite

echo "Comparing bundle sizes..."
du -sh dist/
```

## Testing Checklist

### Documentation Quality
- [ ] Playbook is clear and easy to follow
- [ ] All commands tested and verified
- [ ] Screenshots included where helpful
- [ ] Links to related documentation provided
- [ ] Examples based on actual migrations

### Peer Review
- [ ] Reviewed by senior platform engineer
- [ ] Tested by developer not familiar with migration
- [ ] Feedback incorporated
- [ ] Approved for use

### Validation
- [ ] Successfully used for at least one migration
- [ ] Timing estimates accurate
- [ ] Troubleshooting guide effective
- [ ] No major gaps identified

## Communication Plan

### Stakeholders
- Platform engineering team (primary users)
- All MFE developers (reference during migrations)
- QA team (validation procedures)
- DevOps team (CI/CD changes)

### Distribution
- Playbook location announced in #platform-engineering Slack channel
- Link added to GDU README
- Included in migration kickoff meeting
- Referenced in weekly migration status updates

### Training
- Walkthrough session scheduled for platform engineers
- Q&A session for all developers
- Office hours during first week of migrations

## Rollback Plan

Not applicable for documentation, but the playbook itself must include a comprehensive rollback procedure for MFE migrations.

## Definition of Done

### Development Complete
- [ ] Playbook markdown file created
- [ ] All sections completed with detailed content
- [ ] All commands tested and verified
- [ ] Scripts provided and tested
- [ ] Templates included
- [ ] Examples based on pilot migration

### Review Complete
- [ ] Peer reviewed by 2+ platform engineers
- [ ] Tested by developer unfamiliar with process
- [ ] Feedback incorporated
- [ ] Technical writer review (if available)

### Documentation Complete
- [ ] Playbook committed to GDU repository
- [ ] README updated with link to playbook
- [ ] Announced to engineering team
- [ ] Added to onboarding documentation

### Validation Complete
- [ ] Successfully used for first low-traffic migration
- [ ] Timing estimates validated
- [ ] Any issues/gaps addressed
- [ ] Final approval from Platform Team Lead

## Dependencies

### Blocked By
- AG-TBD-008: Migrate pilot SPA to Vite (learnings needed)
- AG-TBD-009: Create build comparison tooling (tool needed for playbook)

### Blocks
- AG-TBD-011: Migrate low-traffic SPAs to Vite (requires this playbook)

### Related Stories
- AG-TBD-009: Build comparison tooling (referenced in playbook)
- AG-TBD-010: Performance benchmarking suite (referenced in playbook)

## Story Points Justification

**Complexity Factors**:
- **Documentation Complexity**: Medium
  - Requires comprehensive coverage of all migration aspects
  - Must be based on actual pilot migration experience
  - Needs testing and validation
- **Content Creation**: Low
  - Straightforward documentation work
  - Clear structure and requirements
- **Validation Effort**: Medium
  - Requires peer review
  - Must be tested with actual migration
  - May need iteration based on feedback

**Total Points**: 3

## Notes & Decisions

### Technical Decisions
- **Format**: Markdown chosen for easy maintenance and version control
- **Location**: GDU docs folder ensures playbook stays with the code
- **Structure**: Task-oriented sections make it easy to follow step-by-step
- **Scripts**: Bash scripts provided for automation where possible

### Open Questions
- [ ] Should we create a video walkthrough in addition to written playbook?
- [ ] Should we include Slack notification templates?
- [ ] Do we need separate playbooks for different app types (standalone vs non-standalone)?

### Assumptions
- Pilot migration (AG-TBD-008) has been completed successfully
- Build comparison tooling (AG-TBD-009) is available
- At least 10 common issues have been identified during pilot and testing
- Platform engineers have basic knowledge of Vite

---

**Story Owner**: Platform Team Lead
**Created**: 2025-12-15
**Last Updated**: 2025-12-15
**Status**: Ready for Development
