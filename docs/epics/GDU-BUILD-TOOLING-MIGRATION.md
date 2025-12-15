# Epic: GDU Build Tooling Migration - Vite & React Router 7

## Summary

G'day! We're embarking on a significant infrastructure modernization of our GDU (Guru Development Utility) build tooling. Currently, GDU powers all of AutoGuru's microfrontend applications using Webpack 5 for SPA builds and Next.js 14 for SSR applications. While these tools have served us well, the ecosystem has evolved, and we're seeing better performance and developer experience with modern alternatives.

This epic covers migrating our entire MFE build infrastructure to use Vite for SPA builds (replacing Webpack) and React Router 7 for SSR applications (replacing Next.js). We're not just swapping tools - we're maintaining 100% compatibility with our existing CI/CD pipeline, multi-tenant architecture, and deployment infrastructure while unlocking significant performance improvements and a better developer experience.

The migration is structured in two phases: starting with lower-risk Vite adoption for SPAs, followed by React Router 7 for SSR apps. We'll maintain rollback capability throughout and ensure zero regression in existing MFE functionality.

## Business Context

**Platform**: Internal Tools - GDU (Build Infrastructure)
**Primary Users**: Engineering Team (60+ developers across B2C, Fleet, Supplier platforms)
**Business Value**: Faster build times, improved developer productivity, reduced CI/CD costs, modern tooling ecosystem
**Strategic Alignment**: Supports AutoGuru's engineering efficiency goals and technical modernization strategy

## Problem Statement

### Current Situation

Our GDU build tooling currently uses:
- **Webpack 5** for all SPA builds across ~20+ MFE applications
- **Next.js 14** for SSR applications (marketplace, supplier portal, fleet management)
- Complex custom webpack plugins for build manifests, translation hashing, and multi-environment builds
- Build times ranging from 3-8 minutes for SPAs, 5-12 minutes for SSR apps
- Increasing maintenance overhead as webpack configuration grows more complex

### Developer Pain Points

- **Slow build times**: Local development builds taking 30-60 seconds, production builds 5-10+ minutes
- **Complex configuration**: Webpack config spread across multiple files, difficult to modify
- **Poor DX**: Limited HMR support, slower feedback loops during development
- **Outdated tooling**: Webpack 5 is mature but slower than modern alternatives
- **Next.js overhead**: Heavy framework for our SSR needs, complex deployments to Lambda

### Business Impact

- **Engineering productivity**: Developers spending significant time waiting for builds
- **CI/CD costs**: Longer build times = more compute costs in GitHub Actions (~$800/month currently)
- **Deployment speed**: Slower deployments mean longer time to production for critical fixes
- **Developer satisfaction**: Frustration with tooling affects morale and retention
- **Technical debt**: Aging build infrastructure becomes harder to maintain

## Proposed Solution

### Overview

Migrate GDU build tooling to modern alternatives while maintaining 100% backwards compatibility with our existing MFE architecture, CI/CD pipeline, and deployment infrastructure. We'll adopt Vite for SPAs (build-time only, not dev server initially) and React Router 7 for SSR applications, ensuring all our custom build requirements are preserved.

### Key Features

1. **Vite for SPA Builds**
   - Replace Webpack with Vite for production builds
   - Maintain existing build manifest generation
   - Preserve multi-tenant, multi-environment build architecture
   - Keep ESM.sh externals for React dependencies
   - Maintain asset hashing scheme and public path tokenization

2. **React Router 7 for SSR**
   - Replace Next.js with React Router 7 for SSR applications
   - Custom Lambda adapter using AWS Lambda Web Adapter
   - Maintain CDK infrastructure compatibility
   - Preserve security headers and CSP configuration
   - Support multi-environment builds

3. **Gradual Rollout Strategy**
   - Feature flag system (`--bundler vite` CLI option)
   - Parallel builds during transition (webpack + vite)
   - Per-app migration approach
   - Comprehensive testing before cutover

4. **Preserved Architecture**
   - `build-manifest.json` structure unchanged
   - Translation hashing system maintained
   - Multi-tenant builds (au, nz, global)
   - Multi-environment builds (dev, test, uat, preprod, prod, dockerprod, shared)
   - Tapable hooks system for customization

### Out of Scope

- Vite dev server implementation (webpack dev server remains for now)
- Migration of webpack plugins not used in production builds
- Changes to MFE runtime loading mechanism
- Changes to existing MFE applications (beyond build configuration)
- React Router 7 dev server enhancements
- Breaking changes to GDU API

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| SPA build time (production) | 5-8 min | 2-3 min | CI/CD pipeline duration |
| SSR build time (production) | 8-12 min | 3-5 min | CI/CD pipeline duration |
| Local build time (SPA) | 30-60 sec | 10-20 sec | Local development metrics |
| CI/CD compute costs | ~$800/month | ~$500/month | AWS/GitHub Actions billing |
| Build cache hit rate | ~60% | ~80% | Vite cache analytics |
| Developer satisfaction | Baseline survey | +30% | Post-migration survey |
| Zero regressions | N/A | 100% | All MFE tests passing |

## User Journey

### Before (Current State)

1. Developer runs `gdu build` for SPA
2. Webpack analyzes all dependencies (30-60 seconds)
3. Multiple environments built sequentially or in parallel (5-8 minutes total)
4. Build manifest generated via custom webpack plugin
5. Translation files hashed and copied
6. Assets uploaded to S3
7. For SSR: Next.js builds with custom configuration (8-12 minutes)
8. Lambda deployment packages created

### After (Future State)

1. Developer runs `gdu build --bundler vite` for SPA (opt-in initially)
2. Vite performs fast dependency pre-bundling (5-10 seconds)
3. Multiple environments built in parallel with better caching (2-3 minutes total)
4. Build manifest generated via Vite plugin (identical output)
5. Translation files hashed and copied (same process)
6. Assets uploaded to S3 (faster due to smaller build times)
7. For SSR: React Router 7 builds with Lambda adapter (3-5 minutes)
8. Lambda deployment packages created (smaller, faster)

## Technical Scope

### Affected Systems

**Repositories**:
- `octane/packages/gdu`: Primary codebase changes
- `mfe`: All MFE applications (configuration updates only)
- CDK infrastructure in MFE repo for SSR apps

**MFEs Impacted**:
- **SPAs** (~20+ apps): All SPA-based MFEs using webpack builds
  - `fmo-booking`, `sp-booking`, `consumer-app`, `fleet-dashboard`, etc.
- **SSR Apps** (~5 apps): All Next.js-based applications
  - `marketplace`, `supplier-portal`, `fleet-management`, etc.

### API Changes

**GDU CLI**:
- New flag: `gdu build --bundler vite` (opt-in)
- New flag: `gdu build --bundler webpack` (default, explicit)
- New command: `gdu build-ssr --framework react-router` (opt-in)
- Existing commands remain unchanged

**Configuration API**:
```typescript
// guru.config.ts - no changes required
export default {
  srcPaths: ['src'],
  outputPath: 'dist',
  publicPath: '#{PUBLIC_PATH_BASE}/my-app/',
  mountDOMId: '__my-app__',
  frameless: false,
  // ... existing config works as-is
}
```

**Hooks API** (Tapable):
```typescript
// New hooks for Vite
hooks.viteConfig.tap('plugin-name', (config) => {
  // Modify Vite config
  return config;
});

// Existing webpack hooks remain
hooks.webpackConfig.tap('plugin-name', (config) => {
  // Still works
  return config;
});
```

### Infrastructure

**AWS Services**:
- **ECS**: No changes (SPA builds deploy to S3)
- **Lambda**: SSR apps using AWS Lambda Web Adapter
- **S3**: Asset storage (no changes)
- **CloudFront**: CDN distribution (no changes)

**CDK Changes**:
- React Router 7 Lambda handler configuration
- Lambda Web Adapter integration
- Environment variable mappings
- No changes to networking/security

**Environment Variables**:
- All existing env vars preserved
- New: `GDU_BUNDLER=vite|webpack` (optional override)
- New: `GDU_SSR_FRAMEWORK=nextjs|react-router` (optional override)

### Database Impact

- **DynamoDB Tables**: No changes
- **Data Migration**: Not required

## Cross-Platform Impacts

### B2C Marketplace
- **Impact Level**: High
- **Changes**:
  - Marketplace SSR app migrates to React Router 7
  - Consumer-facing SPAs migrate to Vite builds
  - Build pipeline updates in CI/CD
  - Zero customer-facing changes
  - Performance improvements expected

### FleetGuru
- **Impact Level**: Medium
- **Changes**:
  - Fleet SPAs migrate to Vite builds
  - Fleet SSR components migrate to React Router 7
  - Build times improve (faster deployments)
  - No functionality changes

### Supplier Admin
- **Impact Level**: Medium
- **Changes**:
  - Supplier portal SPAs migrate to Vite builds
  - Supplier SSR apps migrate to React Router 7
  - Faster deployment cycles
  - No functionality changes

### Internal Tools
- **Impact Level**: Low
- **Changes**:
  - Admin SPAs migrate to Vite builds
  - Platform Manager builds remain webpack initially
  - Gradual migration path

## Dependencies & Risks

### Dependencies

| Dependency | Type | Owner | Status |
|------------|------|-------|--------|
| Vite 6.x release | External | Vite Team | ✅ Released |
| React Router 7 stable | External | Remix Team | ✅ Released |
| AWS Lambda Web Adapter | External | AWS | ✅ Stable |
| GDU hooks architecture | Internal | Platform Team | ✅ Available |
| CI/CD pipeline updates | Internal | DevOps | 📋 Required |
| MFE runtime compatibility | Internal | Platform Team | ⚠️ Validation needed |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Build manifest incompatibility breaks MFE loading | Low | High | Comprehensive integration tests, parallel builds during transition, feature flags |
| Translation hashing changes break i18n | Low | High | Maintain identical hashing algorithm, extensive i18n testing |
| ESM.sh externals not working with Vite | Medium | Medium | Early testing, fallback to bundling React if needed |
| React Router 7 Lambda cold starts | Medium | Medium | Performance testing, potential Lambda provisioning |
| Developer adoption resistance | Low | Low | Clear documentation, gradual rollout, training sessions |
| Regression in obscure MFE features | Medium | Medium | Comprehensive E2E testing, gradual per-app rollout |
| CI/CD pipeline failures | Low | High | Feature flags, parallel builds, extensive pre-merge testing |
| Increased bundle sizes | Low | Medium | Bundle analysis, optimization before cutover |

## Implementation Approach

### Phases

**Phase 1: Vite Foundation (Sprint 1-2)** - 4 weeks
- Set up Vite configuration infrastructure
- Create Vite build manifest plugin
- Create Vite translation hashing plugin
- Implement CLI flag support (`--bundler vite`)
- Create comprehensive test suite
- Document Vite-specific behavior

**Phase 2: Vite Pilot (Sprint 3)** - 2 weeks
- Migrate single non-critical SPA (internal tool)
- Run parallel builds (webpack + vite)
- Compare build outputs
- Performance benchmarking
- Fix any issues discovered
- Developer feedback collection

**Phase 3: Vite Gradual Rollout (Sprint 4-6)** - 6 weeks
- Migrate 5 low-traffic SPAs
- Migrate 10 medium-traffic SPAs
- Migrate high-traffic SPAs (marketplace components)
- Monitor build times and errors
- Gather developer feedback
- Make webpack default initially

**Phase 4: React Router 7 Foundation (Sprint 7-8)** - 4 weeks
- Create React Router 7 build configuration
- Implement Lambda Web Adapter integration
- Port Next.js security headers to RR7
- Create CDK infrastructure templates
- Build migration guide
- Set up testing infrastructure

**Phase 5: React Router 7 Pilot (Sprint 9)** - 2 weeks
- Migrate single non-critical SSR app
- Test Lambda deployment
- Performance benchmarking
- Cold start analysis
- Security review
- Developer feedback

**Phase 6: React Router 7 Gradual Rollout (Sprint 10-12)** - 6 weeks
- Migrate internal SSR apps
- Migrate supplier portal
- Migrate fleet management SSR
- Migrate marketplace (highest risk)
- Monitor performance and errors
- Final optimization

**Phase 7: Cleanup & Documentation (Sprint 13)** - 2 weeks
- Make Vite default for new SPAs
- Update all documentation
- Create migration runbooks
- Team training sessions
- Remove feature flags
- Deprecation plan for webpack

### Stories Breakdown

| Story ID | Title | Priority | Points | Sprint |
|----------|-------|----------|--------|--------|
| AG-TBD-001 | Create Vite base configuration | Must | 5 | 1 |
| AG-TBD-002 | Implement GuruBuildManifest Vite plugin | Must | 8 | 1 |
| AG-TBD-003 | Implement TranslationHashing Vite plugin | Must | 5 | 1 |
| AG-TBD-004 | Add `--bundler` CLI flag support | Must | 3 | 1 |
| AG-TBD-005 | Create Vite ESM externals configuration | Must | 5 | 2 |
| AG-TBD-006 | Implement multi-environment builds for Vite | Must | 8 | 2 |
| AG-TBD-007 | Set up Vite testing infrastructure | Must | 5 | 2 |
| AG-TBD-008 | Migrate pilot SPA to Vite | Should | 8 | 3 |
| AG-TBD-009 | Create build comparison tooling | Should | 3 | 3 |
| AG-TBD-010 | Performance benchmarking suite | Should | 5 | 3 |
| AG-TBD-011 | Migrate low-traffic SPAs to Vite (5 apps) | Should | 13 | 4 |
| AG-TBD-012 | Migrate medium-traffic SPAs to Vite (10 apps) | Should | 21 | 5 |
| AG-TBD-013 | Migrate high-traffic SPAs to Vite | Should | 13 | 6 |
| AG-TBD-014 | Create React Router 7 base configuration | Must | 8 | 7 |
| AG-TBD-015 | Implement Lambda Web Adapter integration | Must | 13 | 7 |
| AG-TBD-016 | Port security headers to React Router 7 | Must | 5 | 7 |
| AG-TBD-017 | Create RR7 CDK infrastructure templates | Must | 8 | 8 |
| AG-TBD-018 | Implement RR7 build manifest generation | Must | 5 | 8 |
| AG-TBD-019 | Create RR7 migration guide | Should | 5 | 8 |
| AG-TBD-020 | Migrate pilot SSR app to RR7 | Should | 13 | 9 |
| AG-TBD-021 | RR7 performance benchmarking | Should | 5 | 9 |
| AG-TBD-022 | Migrate internal SSR apps to RR7 | Should | 8 | 10 |
| AG-TBD-023 | Migrate supplier portal to RR7 | Should | 13 | 10 |
| AG-TBD-024 | Migrate fleet management SSR to RR7 | Should | 13 | 11 |
| AG-TBD-025 | Migrate marketplace to RR7 | Must | 21 | 11-12 |
| AG-TBD-026 | Final optimization and tuning | Should | 8 | 12 |
| AG-TBD-027 | Documentation and training | Should | 8 | 13 |
| AG-TBD-028 | Webpack deprecation plan | Could | 3 | 13 |

## Acceptance Criteria

### Epic-Level Criteria

| # | Description | Dev Done | Dev Tested | Tested |
|---|------------|----------|------------|--------|
| 1 | All SPAs successfully building with Vite | ☐ | ☐ | ☐ |
| 2 | All SSR apps successfully building with React Router 7 | ☐ | ☐ | ☐ |
| 3 | Build manifest structure identical to webpack output | ☐ | ☐ | ☐ |
| 4 | Translation hashing producing identical results | ☐ | ☐ | ☐ |
| 5 | All multi-tenant, multi-environment builds working | ☐ | ☐ | ☐ |
| 6 | ESM.sh externals loading correctly in production | ☐ | ☐ | ☐ |
| 7 | All existing MFE tests passing (zero regressions) | ☐ | ☐ | ☐ |
| 8 | Performance targets met (build time reduction) | ☐ | ☐ | ☐ |
| 9 | CI/CD pipelines updated and stable | ☐ | ☐ | ☐ |
| 10 | Lambda deployments working for RR7 SSR apps | ☐ | ☐ | ☐ |
| 11 | Security headers and CSP configured correctly | ☐ | ☐ | ☐ |
| 12 | CDK infrastructure deployed successfully | ☐ | ☐ | ☐ |
| 13 | Documentation complete and reviewed | ☐ | ☐ | ☐ |
| 14 | Rollback capability tested and verified | ☐ | ☐ | ☐ |
| 15 | Developer training sessions completed | ☐ | ☐ | ☐ |

## Design & UX

### Figma Designs
- **URL**: N/A (Infrastructure project)
- **Status**: Not Required
- **Designer**: N/A

### UI Components
- **Overdrive Components**: N/A
- **Custom Components**: N/A (no UI changes)

### Accessibility
- **WCAG Level**: N/A (build tooling)
- **Key Requirements**: N/A

## Testing Strategy

### Test Coverage

- **Unit Tests**:
  - Vite plugin logic (build manifest generation, translation hashing)
  - React Router 7 Lambda handler
  - CLI flag parsing and validation
  - Build configuration generation

- **Integration Tests**:
  - Full build process for sample SPA
  - Full build process for sample SSR app
  - Multi-environment build orchestration
  - Build manifest structure validation
  - Translation hashing consistency

- **E2E Tests**:
  - Complete MFE loading in browser
  - SSR page rendering and hydration
  - Multi-tenant routing
  - Dynamic imports and code splitting
  - Production deployment flow

- **Performance Tests**:
  - Build time benchmarks
  - Bundle size analysis
  - Lambda cold start metrics
  - Runtime performance (SSR)

### Test Scenarios

1. **Happy Path**:
   - Standard SPA builds with all environments
   - Standard SSR builds with all environments
   - Build manifest correctly generated
   - Translations correctly hashed
   - MFE loads and functions correctly

2. **Edge Cases**:
   - Very large SPAs (many dependencies)
   - SSR apps with complex routing
   - Multi-tenant builds with environment-specific code
   - Custom webpack hooks compatibility
   - Build failures and error handling

3. **Error Handling**:
   - Invalid configuration detection
   - Build failures with clear error messages
   - Rollback to webpack on Vite failure
   - Missing dependencies
   - Malformed build output

4. **Regression Testing**:
   - All existing MFE functionality unchanged
   - All existing tests passing
   - Visual regression tests for SSR apps
   - API contract tests
   - Performance benchmarks maintained or improved

## Documentation Requirements

- [x] Technical documentation in GDU repository
  - `/docs/build-systems/vite.md`
  - `/docs/build-systems/react-router-7.md`
  - `/docs/migration-guides/webpack-to-vite.md`
  - `/docs/migration-guides/nextjs-to-react-router-7.md`

- [ ] API documentation updated
  - GDU CLI commands
  - Configuration options
  - Plugin development guide
  - Hooks API reference

- [ ] User guides created
  - Developer migration guide
  - Troubleshooting guide
  - Performance optimization guide
  - Best practices

- [ ] Release notes prepared
  - Breaking changes (if any)
  - New features
  - Deprecations
  - Migration timelines

## Stakeholder Communication

### Key Stakeholders

- **Product Owner**: Platform Team Lead
- **Tech Lead**: Principal Engineer, Frontend Infrastructure
- **Engineering Teams**: All MFE developers (~60 people)
- **DevOps Lead**: Infrastructure Team Lead
- **QA Lead**: Quality Engineering Manager

### Communication Plan

- **Kick-off**: Sprint 1, Week 1 - All-hands engineering meeting
- **Weekly Updates**: Monday stand-up (platform team)
- **Bi-weekly Updates**: Engineering all-hands (broader team)
- **Demo Sessions**: End of each phase (6 total demos)
- **Migration Workshops**: Before each rollout phase
- **Office Hours**: Weekly during migration phases
- **Slack Channel**: #gdu-vite-migration

## Release Plan

### Rollout Strategy

**Environment Progression**:
For each MFE:
1. **dev**: Initial testing, developer validation
2. **test**: QA validation, integration testing
3. **uat**: Stakeholder acceptance, performance testing
4. **preprod**: Final production-like testing
5. **prod**: Production release

**Feature Flags**:
- `GDU_BUNDLER=vite|webpack` (environment variable)
- `--bundler vite|webpack` (CLI flag)
- Per-MFE configuration override
- Gradual percentage rollout not applicable (build-time, not runtime)

**Rollback Plan**:
- Keep webpack configuration in place for 2 months
- CLI flag allows instant rollback (`--bundler webpack`)
- CI/CD configured to support both bundlers
- Automated rollback on build failure
- Manual rollback documentation

### Go-Live Checklist

Phase 1 (Vite Foundation):
- [ ] Vite plugins tested and validated
- [ ] CLI flags implemented and tested
- [ ] Documentation reviewed
- [ ] Team training completed

Phase 2 (Vite Pilot):
- [ ] Pilot SPA migrated successfully
- [ ] Build outputs compared and verified
- [ ] Performance benchmarks met
- [ ] Developer feedback addressed

Phase 3 (Vite Rollout):
- [ ] All SPAs migrated to Vite
- [ ] All tests passing
- [ ] CI/CD stable for 2 weeks
- [ ] No critical issues reported

Phase 4 (RR7 Foundation):
- [ ] React Router 7 infrastructure complete
- [ ] Lambda Web Adapter tested
- [ ] CDK templates deployed to dev
- [ ] Security review passed

Phase 5 (RR7 Pilot):
- [ ] Pilot SSR app migrated successfully
- [ ] Lambda deployments working
- [ ] Performance acceptable
- [ ] Developer feedback addressed

Phase 6 (RR7 Rollout):
- [ ] All SSR apps migrated to RR7
- [ ] All tests passing
- [ ] Production monitoring stable
- [ ] No critical issues

Phase 7 (Cleanup):
- [ ] Documentation finalized
- [ ] Team training completed
- [ ] Webpack deprecation communicated
- [ ] Monitoring dashboards updated

## Key Files to Create/Modify

### New Files (Vite)

```
packages/gdu/config/vite/
├── vite.config.ts              # Base Vite configuration
├── vite.spa.config.ts          # SPA-specific config
├── plugins/
│   ├── GuruBuildManifest.ts   # Build manifest generation
│   ├── TranslationHashingPlugin.ts  # Translation hashing
│   └── EsmExternals.ts        # ESM.sh externals handling
└── utils/
    ├── multiEnvBuilder.ts     # Multi-environment orchestration
    └── publicPath.ts          # Public path tokenization
```

### New Files (React Router 7)

```
packages/gdu/config/react-router/
├── react-router.config.ts      # Base RR7 configuration
├── lambda/
│   ├── handler.ts             # Lambda handler with Web Adapter
│   └── adapter.ts             # AWS Lambda Web Adapter integration
├── plugins/
│   ├── GuruBuildManifest.ts   # Build manifest for SSR
│   └── SecurityHeaders.ts     # CSP and security headers
└── cdk/
    ├── stack.template.ts      # CDK infrastructure template
    └── lambda-config.ts       # Lambda configuration
```

### Modified Files

```
packages/gdu/
├── package.json                    # Add Vite, RR7 dependencies
├── commands/build/
│   ├── index.ts                    # Add --bundler flag
│   ├── buildSPA-vite.ts           # New: Vite SPA builder
│   ├── buildSPA-webpack.ts        # Existing: renamed for clarity
│   ├── buildSSR-react-router.ts   # New: RR7 SSR builder
│   └── buildSSR-nextjs.ts         # Existing: renamed for clarity
├── lib/
│   ├── config.ts                   # Add bundler selection logic
│   └── hooks.ts                    # Add Vite/RR7 hooks
└── utils/
    └── buildRunner.ts              # Orchestrate bundler selection
```

## Performance Targets

### Build Time Improvements

| Application Type | Current (Webpack) | Target (Vite/RR7) | Improvement |
|-----------------|-------------------|-------------------|-------------|
| Small SPA (<100 modules) | 2 min | 30 sec | 75% |
| Medium SPA (100-500 modules) | 5 min | 1.5 min | 70% |
| Large SPA (500+ modules) | 8 min | 3 min | 62% |
| Small SSR (<200 modules) | 5 min | 2 min | 60% |
| Large SSR (500+ modules) | 12 min | 5 min | 58% |

### Bundle Size Targets

| Metric | Current | Target | Notes |
|--------|---------|--------|-------|
| Main bundle (avg) | 250 KB | 200 KB | Better tree-shaking |
| Total bundle (avg) | 800 KB | 750 KB | Optimized chunks |
| Framework chunk | Externalized (ESM.sh) | Same | No change |
| Lazy chunks (avg) | 50 KB | 45 KB | Better code splitting |

### Runtime Performance (SSR)

| Metric | Current (Next.js) | Target (RR7) | Notes |
|--------|------------------|--------------|-------|
| Lambda cold start | 800-1200ms | 600-900ms | Lighter runtime |
| Lambda warm start | 50-100ms | 50-100ms | Similar |
| Time to First Byte | 200-400ms | 150-300ms | Faster SSR |
| Bundle size | 8-12 MB | 6-10 MB | Lighter framework |

## Monitoring & Observability

### Build Metrics

- Build duration per MFE
- Build success/failure rate
- Cache hit rate (Vite cache)
- Bundle size trends
- CI/CD compute time
- Error frequency by type

### Runtime Metrics (SSR)

- Lambda cold start duration
- Lambda warm start duration
- Memory usage
- Error rates
- Request duration (p50, p95, p99)
- Cache hit rates (CloudFront)

### Developer Metrics

- Local build time
- Developer build frequency
- Build errors encountered
- Time to resolution
- Developer satisfaction scores

### Alerts

- Build failure rate >5%
- Build time regression >20%
- Lambda cold start >1.5s
- Error rate >1%
- Bundle size increase >10%

## Notes

### Critical Success Factors

1. **Zero Regression**: Absolutely no breaking changes to existing MFE functionality
2. **Gradual Rollout**: Per-app migration prevents big-bang failures
3. **Rollback Capability**: Must be able to revert instantly
4. **Developer Buy-in**: Clear communication and training critical
5. **Testing Coverage**: Comprehensive testing prevents production issues

### Technical Decisions

- **Why Vite over others?**: Best ecosystem support, excellent build performance, ESM-first
- **Why React Router 7?**: Lightweight, excellent SSR support, Vite-native, no vendor lock-in
- **Why not Vite dev server?**: Lower risk to start with production builds only
- **Why Lambda Web Adapter?**: Standard approach, well-supported, easy migration from Next.js

### Open Questions

- [ ] Should we migrate dev server to Vite in same epic or separate?
- [ ] Timeline for complete webpack deprecation (6 months? 12 months?)
- [ ] React Router 7 framework mode vs library mode?
- [ ] Single Lambda per SSR app or shared Lambda?

### Resources

- **Vite Documentation**: https://vitejs.dev
- **React Router 7 Documentation**: https://reactrouter.com
- **AWS Lambda Web Adapter**: https://github.com/awslabs/aws-lambda-web-adapter
- **GDU Documentation**: `/packages/gdu/README.md`
- **Migration Tracking Board**: [Jira Link TBD]

---

**Epic Owner**: Platform Team Lead
**Created**: 2025-12-15
**Last Updated**: 2025-12-15
**Status**: Draft - Ready for Review
