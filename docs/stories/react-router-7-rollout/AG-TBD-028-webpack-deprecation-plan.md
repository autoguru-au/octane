# Story: GDU. Build System. As a Platform Engineer, I want to deprecate webpack and establish sunset timeline, so that we simplify our build tooling and reduce maintenance burden

## Story Details

**Story ID**: AG-TBD-028
**Epic**: AG-TBD-000 - GDU Build Tooling Migration - Vite & React Router 7
**Priority**: Should Have
**Story Points**: 3
**Sprint**: Sprint 13

## Description

### Summary
After successfully migrating all applications to Vite and React Router 7, we need to formally deprecate webpack, communicate the deprecation timeline, create a transition plan for any remaining webpack usage, and prepare for eventual removal of webpack from the codebase. This story focuses on the planning and communication aspects, not the actual code removal (which will be a future epic).

Webpack served AutoGuru well for years, but now that all applications are using Vite, maintaining two build systems creates unnecessary complexity, cognitive load, and maintenance burden. A clear deprecation plan ensures orderly transition and prevents new webpack usage.

### Background
Before the React Router 7 migration:
- All SSR applications used Next.js (webpack-based)
- CSR applications were already migrated to Vite (previous epic)
- Webpack configuration across multiple applications
- Custom webpack plugins and loaders
- Significant webpack expertise required

After the migration (current state):
- All SSR applications use React Router 7 with Vite
- All CSR applications use Vite
- Webpack no longer actively used
- Webpack code and configuration still present in codebase
- Risk of developers accidentally using webpack for new applications

### User Value
Developers benefit from a single, modern build system (Vite) that is faster, simpler, and better supported. The business benefits from reduced maintenance costs, faster build times, and improved developer productivity.

## User Persona

**Role**: Platform Engineer / New Developer
**Name**: "Jamie the Platform Engineer"
**Context**: Maintaining build tooling, onboarding new developers, reviewing code
**Goals**: Simplify build system, prevent technical debt, ensure clear migration path
**Pain Points**: Confusion about which build tool to use, maintaining two systems, accidental webpack usage

## Acceptance Criteria

### Deprecation Planning

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Webpack deprecation timeline created and approved | ☐ | ☐ | ☐ |
| 2 | Webpack removal checklist created | ☐ | ☐ | ☐ |
| 3 | Impact analysis completed (dependencies, scripts, CI/CD) | ☐ | ☐ | ☐ |
| 4 | Sunset milestones defined with dates | ☐ | ☐ | ☐ |

### Communication

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Deprecation announcement sent to engineering team | ☐ | ☐ | ☐ |
| 2 | Webpack deprecation added to README with warning | ☐ | ☐ | ☐ |
| 3 | Code review guidelines updated to flag webpack usage | ☐ | ☐ | ☐ |
| 4 | CI/CD updated to warn on webpack usage | ☐ | ☐ | ☐ |

### Documentation

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Deprecation guide created (what, why, when, alternatives) | ☐ | ☐ | ☐ |
| 2 | Migration path from webpack to Vite documented | ☐ | ☐ | ☐ |
| 3 | Webpack-specific documentation archived | ☐ | ☐ | ☐ |
| 4 | FAQs created for common webpack questions | ☐ | ☐ | ☐ |

### Preventive Measures

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Webpack templates removed from project scaffolding | ☐ | ☐ | ☐ |
| 2 | CI/CD fails if new webpack config added | ☐ | ☐ | ☐ |
| 3 | Dependabot/Renovate excludes webpack updates | ☐ | ☐ | ☐ |
| 4 | Linter rules flag webpack imports (with migration hint) | ☐ | ☐ | ☐ |

### Future Preparation

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | Webpack removal epic created for future sprint | ☐ | ☐ | ☐ |
| 2 | Dependencies that can be safely removed identified | ☐ | ☐ | ☐ |
| 3 | Code that can be safely deleted identified | ☐ | ☐ | ☐ |

## Technical Implementation

### Phase 1: Impact Analysis

#### 1.1 Identify Webpack Usage

```bash
# Find all webpack config files
find . -name "webpack*.js" -o -name "webpack*.ts"

# Find all webpack imports
grep -r "webpack" --include="*.ts" --include="*.js" .

# Find webpack dependencies
cat package.json | jq '.dependencies, .devDependencies' | grep webpack

# Find webpack-specific loaders and plugins
cat package.json | jq '.dependencies, .devDependencies' | grep -E "loader|plugin"
```

**Expected Findings**:
```
Webpack Config Files:
- packages/gdu/webpack/webpack.config.js (legacy, unused)
- packages/gdu/apps/legacy-dashboard/webpack.config.js (unused)

Webpack Dependencies:
- webpack: 5.88.0
- webpack-cli: 5.1.4
- webpack-dev-server: 4.15.1
- Various loaders: babel-loader, ts-loader, css-loader, etc.
- Various plugins: HtmlWebpackPlugin, MiniCssExtractPlugin, etc.

Webpack Scripts:
- package.json: "build:webpack" (legacy)
- CI/CD: webpack build steps (unused)

Webpack Documentation:
- docs/webpack-setup.md (outdated)
- docs/custom-loaders.md (outdated)
```

#### 1.2 Dependency Analysis

```typescript
// scripts/analyze-webpack-deps.ts
import { readPackageJson } from './utils';

interface DependencyAnalysis {
  webpackCore: string[];
  webpackLoaders: string[];
  webpackPlugins: string[];
  canRemoveImmediately: string[];
  needsInvestigation: string[];
}

async function analyzeWebpackDependencies(): Promise<DependencyAnalysis> {
  const pkg = await readPackageJson();
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  const webpackCore = Object.keys(allDeps).filter((dep) =>
    dep.startsWith('webpack')
  );

  const webpackLoaders = Object.keys(allDeps).filter((dep) =>
    dep.endsWith('-loader')
  );

  const webpackPlugins = Object.keys(allDeps).filter(
    (dep) =>
      dep.includes('webpack') &&
      (dep.endsWith('-plugin') || dep.includes('plugin'))
  );

  // Analyze if safe to remove
  const canRemoveImmediately = [...webpackCore]; // Webpack itself safe to remove
  const needsInvestigation = [
    ...webpackLoaders.filter((dep) => !isViteEquivalent(dep)),
    ...webpackPlugins.filter((dep) => !isViteEquivalent(dep)),
  ];

  return {
    webpackCore,
    webpackLoaders,
    webpackPlugins,
    canRemoveImmediately,
    needsInvestigation,
  };
}

// Generate removal checklist
function generateRemovalChecklist(analysis: DependencyAnalysis) {
  return `
## Webpack Removal Checklist

### Phase 1: Immediate Removal (Sprint 14)
- [ ] Remove webpack core packages
${analysis.canRemoveImmediately.map((dep) => `  - [ ] ${dep}`).join('\n')}

### Phase 2: Investigate & Replace (Sprint 15)
${analysis.needsInvestigation.map((dep) => `- [ ] ${dep} - Find Vite equivalent`).join('\n')}

### Phase 3: Clean Up (Sprint 16)
- [ ] Remove webpack config files
- [ ] Remove webpack scripts from package.json
- [ ] Remove webpack CI/CD steps
- [ ] Archive webpack documentation
- [ ] Update onboarding docs
  `;
}
```

### Phase 2: Deprecation Communication

#### 2.1 Deprecation Announcement

```markdown
# Webpack Deprecation Announcement

## Summary
Effective immediately, webpack is **deprecated** at AutoGuru. All new applications must use Vite.

## Timeline

| Date | Milestone |
|------|-----------|
| 2025-01-15 | **DEPRECATION** - Webpack deprecated, Vite required for new apps |
| 2025-02-01 | Sprint 14 - Remove webpack core packages |
| 2025-02-15 | Sprint 15 - Investigate and replace webpack-specific loaders |
| 2025-03-01 | Sprint 16 - Complete webpack removal from codebase |
| 2025-03-15 | **SUNSET** - Webpack completely removed |

## What This Means

### For New Development
- ✅ **DO**: Use Vite for all new applications
- ✅ **DO**: Use React Router 7 for SSR applications
- ❌ **DON'T**: Create new webpack configs
- ❌ **DON'T**: Add webpack dependencies

### For Existing Applications
- All applications already migrated to Vite ✓
- No action required from teams

### For Platform Team
- Remove webpack from codebase over next 2 months
- Archive webpack documentation
- Update onboarding materials

## Why Deprecate Webpack?

### All Apps Migrated
All SSR and CSR applications now use Vite. Webpack is no longer actively used.

### Maintenance Burden
Maintaining two build systems creates complexity and cognitive load.

### Developer Experience
Vite is faster, simpler, and provides better DX than webpack.

### Performance
Vite build times are 5-10x faster than webpack.

## Migration Path

Already migrated! If you discover legacy webpack usage:
1. Refer to [Vite Migration Guide](./docs/vite-migration.md)
2. Ask in #platform-team for help
3. Do not create new webpack configs

## Questions?

- Slack: #platform-team
- Email: platform-team@autoguru.com.au
- Documentation: [Vite Guide](./docs/react-router-7/)

---

**Effective Date**: January 15, 2025
**Owner**: Platform Team
**Approval**: CTO, Engineering Leads
```

#### 2.2 README Warning

```markdown
# GDU - AutoGuru Design Universe

## Build System

**⚠️ WEBPACK IS DEPRECATED ⚠️**

As of January 15, 2025, webpack is **deprecated** and will be removed from the codebase by March 15, 2025.

**Use Vite for all applications.**

### Supported Build Tools

| Tool | Status | Use Case |
|------|--------|----------|
| **Vite** | ✅ Active | All new apps (CSR and SSR) |
| **React Router 7** | ✅ Active | SSR applications |
| webpack | ⛔ Deprecated | Do not use |

### Getting Started

For new applications:
- [React Router 7 Guide](./docs/react-router-7/getting-started.md) - SSR apps
- [Vite Guide](./docs/vite/getting-started.md) - CSR apps

### Legacy Webpack

If you find webpack configs or documentation:
- **DO NOT USE** for new applications
- Webpack is being removed from the codebase
- Refer to Vite documentation instead

Questions? Ask in #platform-team
```

### Phase 3: Preventive Measures

#### 3.1 CI/CD Warnings

```yaml
# .github/workflows/lint.yml
name: Lint

on: [pull_request]

jobs:
  check-webpack-usage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for webpack usage
        run: |
          # Check for webpack config files
          if find . -name "webpack*.js" -o -name "webpack*.ts" | grep -v node_modules; then
            echo "❌ ERROR: webpack config files detected"
            echo "webpack is deprecated. Use Vite instead."
            echo "See: docs/react-router-7/getting-started.md"
            exit 1
          fi

          # Check for webpack imports in new files
          git diff --name-only origin/main... | while read file; do
            if grep -q "webpack" "$file"; then
              echo "❌ ERROR: webpack import detected in $file"
              echo "webpack is deprecated. Use Vite instead."
              exit 1
            fi
          done

      - name: Check for webpack dependencies
        run: |
          # Fail if new webpack dependencies added
          git diff origin/main... package.json | grep -q '"webpack"' && {
            echo "❌ ERROR: webpack dependency added"
            echo "webpack is deprecated. Use Vite instead."
            exit 1
          } || true
```

#### 3.2 ESLint Rule

```typescript
// eslint-rules/no-webpack.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow webpack usage (deprecated)',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noWebpack:
        'webpack is deprecated. Use Vite instead. See: docs/react-router-7/getting-started.md',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value.includes('webpack')) {
          context.report({
            node,
            messageId: 'noWebpack',
          });
        }
      },
      CallExpression(node) {
        if (
          node.callee.name === 'require' &&
          node.arguments[0]?.value?.includes('webpack')
        ) {
          context.report({
            node,
            messageId: 'noWebpack',
          });
        }
      },
    };
  },
};
```

```json
// .eslintrc.json
{
  "rules": {
    "no-webpack": "error"
  }
}
```

#### 3.3 Renovate/Dependabot Configuration

```json
// renovate.json
{
  "packageRules": [
    {
      "matchPackagePatterns": ["webpack"],
      "enabled": false,
      "description": "webpack is deprecated - do not update"
    }
  ]
}
```

### Phase 4: Future Removal Planning

#### 4.1 Removal Epic Template

```markdown
# Epic: Remove Webpack from Codebase

## Context
Webpack was deprecated on January 15, 2025. All applications migrated to Vite.
This epic removes all webpack code, dependencies, and documentation.

## Goals
- Remove webpack dependencies
- Remove webpack configuration files
- Remove webpack scripts
- Archive webpack documentation
- Clean up CI/CD pipelines

## Stories

### AG-WEBPACK-001: Remove Webpack Core Dependencies (3 points)
Remove webpack, webpack-cli, webpack-dev-server packages

### AG-WEBPACK-002: Remove Webpack Loaders and Plugins (5 points)
Remove or find Vite equivalents for webpack-specific loaders/plugins

### AG-WEBPACK-003: Remove Webpack Configuration Files (2 points)
Delete all webpack.config.js files and related configuration

### AG-WEBPACK-004: Clean Up Scripts and CI/CD (3 points)
Remove webpack build scripts from package.json and CI/CD pipelines

### AG-WEBPACK-005: Archive Documentation (2 points)
Move webpack documentation to archive, update links

### AG-WEBPACK-006: Final Verification (1 point)
Verify no webpack references remain, all tests pass

**Total**: 16 points (1-2 sprints)
```

#### 4.2 Dependencies to Remove

```json
// dependencies-to-remove.json
{
  "webpackCore": [
    "webpack",
    "webpack-cli",
    "webpack-dev-server",
    "webpack-merge"
  ],
  "webpackLoaders": [
    "babel-loader",
    "ts-loader",
    "css-loader",
    "style-loader",
    "sass-loader",
    "file-loader",
    "url-loader"
  ],
  "webpackPlugins": [
    "html-webpack-plugin",
    "mini-css-extract-plugin",
    "terser-webpack-plugin",
    "webpack-bundle-analyzer"
  ],
  "viteEquivalents": {
    "babel-loader": "vite handles transpilation natively",
    "ts-loader": "@vitejs/plugin-react handles TypeScript",
    "css-loader": "vite handles CSS imports natively",
    "sass-loader": "vite-plugin-sass",
    "html-webpack-plugin": "vite handles HTML natively",
    "webpack-bundle-analyzer": "rollup-plugin-visualizer"
  }
}
```

## Deprecation Timeline

```
Jan 2025          Feb 2025          Mar 2025
   |                 |                 |
   v                 v                 v
DEPRECATION      REMOVAL START     COMPLETE
   |                 |                 |
   |-- Sprint 13 ----|-- Sprint 14 ----|-- Sprint 15 --|-- Sprint 16 --|
   |                 |                 |                |               |
   |                 |                 |                |               |
Announce        Remove Core      Remove Loaders    Clean Up Docs    SUNSET
Warning in CI   Dependencies     & Plugins         Archive          Complete
Update Docs
Code Review
Guidelines
```

### Milestones

**Sprint 13 (Current) - Deprecation**
- ✅ Announce deprecation
- ✅ Update README with warning
- ✅ Update code review guidelines
- ✅ Add CI/CD warnings
- ✅ Create removal epic

**Sprint 14 - Core Removal**
- Remove webpack core packages
- Remove webpack-dev-server
- Remove webpack-cli
- Verify builds still work

**Sprint 15 - Loader/Plugin Removal**
- Audit all loaders and plugins
- Find Vite equivalents if needed
- Remove unused loaders/plugins
- Test thoroughly

**Sprint 16 - Final Cleanup**
- Remove webpack configs
- Remove webpack scripts
- Archive documentation
- Update all references
- Final verification

## Definition of Done

### Deprecation Planning Complete
- [ ] Impact analysis completed
- [ ] Removal timeline created and approved
- [ ] Removal epic created
- [ ] Dependencies identified for removal
- [ ] Vite equivalents documented

### Communication Complete
- [ ] Deprecation announcement sent to engineering
- [ ] README updated with deprecation warning
- [ ] Code review guidelines updated
- [ ] Team meeting held to discuss deprecation
- [ ] FAQ created for common questions

### Preventive Measures Implemented
- [ ] CI/CD warns on webpack usage
- [ ] ESLint rule flags webpack imports
- [ ] Renovate/Dependabot excludes webpack updates
- [ ] Project templates exclude webpack
- [ ] Documentation clearly states webpack deprecated

### Documentation Complete
- [ ] Deprecation guide published
- [ ] Webpack-to-Vite migration path documented
- [ ] Webpack documentation marked as deprecated
- [ ] Archive plan for webpack docs created
- [ ] Removal checklist created

### Future Planning Complete
- [ ] Removal epic created with stories
- [ ] Dependencies to remove identified
- [ ] Code to delete identified
- [ ] Testing strategy for removal defined
- [ ] Rollback plan for removal defined (if needed)

## Dependencies

### Blocked By
- AG-TBD-025: Marketplace migration (all apps must be migrated first)
- AG-TBD-027: Documentation (need Vite docs complete before removing webpack docs)

### Blocks
- None (deprecation enables but doesn't block future work)

### Related Stories
- AG-TBD-027: Documentation and training (reference deprecation timeline)
- Future epic: Webpack removal (actual code removal)

## Story Points Justification

**Complexity Factors**:

- **Analysis Work**: Low-Medium
  - Identify webpack usage
  - Create dependency list
  - Plan removal timeline
  - Estimated: 1 day

- **Communication**: Low
  - Write deprecation announcement
  - Update README
  - Send emails/Slack messages
  - Estimated: 0.5 days

- **Preventive Measures**: Low-Medium
  - CI/CD warnings
  - ESLint rule
  - Update configs
  - Estimated: 1 day

- **Documentation**: Low-Medium
  - Deprecation guide
  - Mark docs as deprecated
  - Create FAQs
  - Estimated: 1 day

**Total Points**: 3

**Breakdown**:
- Analysis: 1 point
- Communication and documentation: 1 point
- Preventive measures: 1 point

## Notes & Decisions

### Technical Decisions

- **Deprecation Timeline**: 2 months from announcement to complete removal
  - Rationale: All apps already migrated, no blockers, reasonable timeline

- **Hard Fail on New Webpack Usage**: CI/CD fails if webpack detected in new code
  - Rationale: Prevent accidental usage, make deprecation clear

- **Immediate Deprecation**: Don't wait, announce now
  - Rationale: All apps migrated, no reason to delay

- **Sunset in Sprint 16**: Complete removal by March 2025
  - Rationale: Allows time for thorough cleanup, documentation archival

### Open Questions
- [ ] Should we keep webpack for emergency rollback? (Recommend no, all apps proven stable on Vite)
- [ ] What to do with webpack expertise? (Recommend document as historical knowledge)
- [ ] Should we celebrate webpack removal? (Recommend yes, it served us well!)

### Assumptions
- All applications successfully migrated to Vite (proven)
- No hidden webpack usage in codebase
- Team understands and supports deprecation
- Removal won't break anything (verified during removal epic)

### Success Criteria

Deprecation is successful if:
- ✓ Deprecation clearly communicated to all developers
- ✓ No new webpack usage detected
- ✓ Removal epic created and ready for future sprint
- ✓ CI/CD prevents webpack usage
- ✓ Documentation clearly states webpack deprecated
- ✓ Team understands migration path to Vite
- ✓ Zero confusion about which build tool to use

## Risks

**Risk Level**: Very Low

**Key Risks**:

1. **Accidental Webpack Usage** (Low probability, Low impact)
   - Mitigation: CI/CD warnings, ESLint rules, code review guidelines
   - Impact: Quick fix, revert commit

2. **Developer Confusion** (Low probability, Low impact)
   - Mitigation: Clear communication, updated documentation
   - Impact: Support questions, easily resolved

3. **Hidden Webpack Dependencies** (Low probability, Medium impact)
   - Mitigation: Thorough dependency analysis before removal
   - Impact: May need to find replacement, delay removal

**Overall Risk Posture**: Very low risk. All apps migrated, deprecation is formality before cleanup.

## Celebration Plan

When webpack is fully removed (Sprint 16):

```markdown
# 🎉 Webpack Sunset Celebration

## Thank You, Webpack!

Webpack served AutoGuru from 2018 to 2025 (7 years!):
- Powered our applications through critical growth
- Enabled complex build pipelines
- Served millions of users

## Welcome, Vite!

New era of build tooling:
- ⚡ 10x faster builds
- 🎯 Simpler configuration
- 💪 Better developer experience
- 🚀 Modern, maintained, future-proof

## Team Achievement

Completed full migration:
- 5 SSR applications migrated
- Zero downtime deployments
- No customer impact
- Proven infrastructure

Thank you to everyone who contributed to this migration! 🙌
```

---

**Note**: This story focuses on deprecation planning and communication. Actual code removal will be a separate epic (AG-WEBPACK-XXX) scheduled for Sprints 14-16.
