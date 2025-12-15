# Story: PM. Build Tooling. As a Developer, I want to migrate a pilot SPA to Vite, so that I can validate the migration in a real-world scenario

## Story Details

**Story ID**: AG-TBD-008
**Epic**: AG-EPIC-VITE - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Must Have
**Story Points**: 8
**Sprint**: Sprint 3

## Description

### Summary
Select a non-critical internal tool SPA and migrate it to Vite builds, running both webpack and Vite builds in parallel during a validation period. This provides real-world validation of the Vite build system before broader rollout.

### Background
We need practical validation that Vite builds work in production. Choosing an internal tool (admin panel, developer tools, etc.) minimises risk while providing genuine usage data.

### User Value
Validates Vite migration approach with real production usage, identifies edge cases, and builds team confidence before migrating customer-facing MFEs.

## Acceptance Criteria

### Functional Requirements

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Given pilot SPA selected, When documented, Then selection criteria and rationale are clear | ☐ | ☐ | ☐ |
| 2 | Given pilot SPA, When built with both bundlers, Then webpack and Vite outputs coexist | ☐ | ☐ | ☐ |
| 3 | Given Vite build, When deployed to staging, Then MFE loads and functions correctly | ☐ | ☐ | ☐ |
| 4 | Given Vite build, When inspecting manifest, Then structure matches webpack exactly | ☐ | ☐ | ☐ |
| 5 | Given Vite build, When comparing bundle sizes, Then difference documented and explained | ☐ | ☐ | ☐ |
| 6 | Given Vite build, When testing all features, Then no functional regressions found | ☐ | ☐ | ☐ |
| 7 | Given Vite build, When deployed to production, Then runs for 1 week without issues | ☐ | ☐ | ☐ |
| 8 | Given migration complete, When documented, Then findings and recommendations captured | ☐ | ☐ | ☐ |

## Technical Implementation

### Pilot SPA Selection Criteria

```markdown
## Candidate SPAs for Pilot Migration

### Selection Criteria
1. **Low Risk**: Internal tool or non-critical user-facing feature
2. **Representative**: Uses typical MFE patterns (i18n, routing, API calls)
3. **Moderate Complexity**: Not too simple (validates real scenarios) but not overly complex
4. **Good Test Coverage**: Has tests to validate no regressions
5. **Active Development**: Team available for quick iteration

### Recommended Candidates
1. **Platform Manager Admin Panel** - Internal tool, representative features
2. **Fleet Provider Dashboard** - Internal-facing, complex enough to validate
3. **Developer Tools MFE** - Internal, low risk, actively maintained

### Selected Pilot: [TBD - To be decided during sprint planning]
**Rationale**: [Document why this specific MFE was chosen]
```

### Parallel Build Setup

```bash
# package.json scripts for pilot MFE
{
  "scripts": {
    "build": "gdu build --bundler webpack",
    "build:vite": "gdu build --bundler vite",
    "build:both": "yarn build && yarn build:vite",
    "build:compare": "yarn build:both && node scripts/compare-builds.js"
  }
}
```

### Build Comparison Script

```typescript
// scripts/compare-builds.ts
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface BuildComparison {
  webpack: BuildMetrics;
  vite: BuildMetrics;
  differences: Differences;
}

interface BuildMetrics {
  totalSize: number;
  fileCount: number;
  manifest: any;
  bundleFiles: string[];
}

function analyzeBuild(distPath: string): BuildMetrics {
  // Analyze build output
  const files = readdirSync(distPath, { recursive: true });
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const totalSize = jsFiles.reduce((sum, file) => {
    const stat = statSync(join(distPath, file));
    return sum + stat.size;
  }, 0);

  const manifest = JSON.parse(
    readFileSync(join(distPath, 'build-manifest.json'), 'utf-8')
  );

  return {
    totalSize,
    fileCount: files.length,
    manifest,
    bundleFiles: jsFiles,
  };
}

function compareBuilds(): BuildComparison {
  const webpack = analyzeBuild('dist/prod');
  const vite = analyzeBuild('dist-vite/prod');

  const differences = {
    sizeChange: ((vite.totalSize - webpack.totalSize) / webpack.totalSize) * 100,
    fileCountChange: vite.fileCount - webpack.fileCount,
    manifestDifferences: compareManifests(webpack.manifest, vite.manifest),
  };

  return { webpack, vite, differences };
}

// Run comparison
const comparison = compareBuilds();
console.log('Build Comparison Report:');
console.log('========================');
console.log(`Webpack: ${(comparison.webpack.totalSize / 1024).toFixed(2)} KB`);
console.log(`Vite: ${(comparison.vite.totalSize / 1024).toFixed(2)} KB`);
console.log(`Difference: ${comparison.differences.sizeChange.toFixed(2)}%`);
```

### Deployment Validation Checklist

```markdown
## Pilot SPA Validation Checklist

### Pre-Deployment
- [ ] Vite build completes successfully for all environments
- [ ] Build manifest structure validated against schema
- [ ] Bundle size comparison completed and documented
- [ ] All automated tests pass
- [ ] Manual smoke testing completed in local environment

### Staging Deployment
- [ ] Deploy Vite build to staging environment
- [ ] Verify MFE loads in orchestrator
- [ ] Test all major user flows
- [ ] Verify i18n works correctly (all locales)
- [ ] Test lazy-loaded routes
- [ ] Check browser console for errors
- [ ] Validate analytics tracking
- [ ] Test on supported browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices

### Production Deployment (Canary)
- [ ] Deploy Vite build to production
- [ ] Monitor error rates for 24 hours
- [ ] Monitor performance metrics
- [ ] Check for any user-reported issues
- [ ] Compare bundle load times vs webpack

### Week 1 Monitoring
- [ ] Daily error rate monitoring
- [ ] Performance metrics comparison
- [ ] User feedback collection
- [ ] Document any issues found
- [ ] Compare webpack vs Vite performance

### Success Criteria
- [ ] Zero critical bugs introduced
- [ ] Performance equal or better than webpack
- [ ] Bundle size within ±15% of webpack
- [ ] No increase in error rate
- [ ] Positive developer experience feedback
```

### Documentation Template

```markdown
# Pilot SPA Migration Report: [MFE Name]

## Summary
**MFE**: [Name]
**Migration Date**: [Date]
**Duration**: [Time]
**Result**: ✅ Success / ⚠️ Partial / ❌ Failed

## Metrics

### Build Performance
| Metric | Webpack | Vite | Change |
|--------|---------|------|--------|
| Build Time | [X]s | [Y]s | [+/-]% |
| Bundle Size (JS) | [X]KB | [Y]KB | [+/-]% |
| Bundle Size (CSS) | [X]KB | [Y]KB | [+/-]% |
| Chunk Count | [X] | [Y] | [+/-] |

### Runtime Performance
| Metric | Webpack | Vite | Change |
|--------|---------|------|--------|
| Initial Load Time | [X]ms | [Y]ms | [+/-]ms |
| Time to Interactive | [X]ms | [Y]ms | [+/-]ms |
| First Contentful Paint | [X]ms | [Y]ms | [+/-]ms |

## Issues Found

### Critical
- [ ] None / [List issues]

### Non-Critical
- [ ] None / [List issues]

## Differences from Webpack

### Expected Differences
- [List intentional differences, e.g., "Hash algorithm differences"]

### Unexpected Differences
- [List surprises]

## Recommendations

### For Next Migration
1. [Recommendation 1]
2. [Recommendation 2]

### Process Improvements
1. [Improvement 1]
2. [Improvement 2]

## Lessons Learned
[Document insights, gotchas, tips for future migrations]
```

## Definition of Done

- [x] Pilot SPA selected and documented
- [x] Vite build working for all environments
- [x] Parallel builds (webpack + Vite) running in CI/CD
- [x] Deployed to staging and validated
- [x] Deployed to production (canary) and monitored for 1 week
- [x] Build comparison completed and documented
- [x] Migration report completed
- [x] Recommendations documented for broader rollout

## Dependencies

**Blocked By**: AG-TBD-001 through AG-TBD-007
**Blocks**: Broader Vite migration rollout

## Story Points: 8

**Complexity**: High
- Real-world validation introduces unknowns
- Requires careful monitoring and comparison
- Documentation and analysis effort
- May uncover issues requiring fixes
