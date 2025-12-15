# Vite Foundation Phase - User Stories

This directory contains detailed user stories for Phase 1-2 of the GDU Build Tooling Migration to Vite.

## Overview

**Epic**: GDU Build Tooling Migration - Vite & React Router 7
**Phase**: Vite Foundation (Sprints 1-3)
**Goal**: Establish Vite as production-ready alternative to webpack for SPA builds

## Story Index

### Sprint 1: Core Configuration & Plugins

| Story ID | Title | Points | Status | Priority |
|----------|-------|--------|--------|----------|
| AG-TBD-001 | [Create Vite base configuration](./AG-TBD-001-vite-base-configuration.md) | 5 | 📋 | Must Have |
| AG-TBD-002 | [Implement GuruBuildManifest Vite plugin](./AG-TBD-002-gurubuildmanifest-plugin.md) | 8 | 📋 | Must Have |
| AG-TBD-003 | [Implement TranslationHashing Vite plugin](./AG-TBD-003-translationhashing-plugin.md) | 5 | 📋 | Must Have |
| AG-TBD-004 | [Add --bundler CLI flag support](./AG-TBD-004-cli-flag-support.md) | 3 | 📋 | Must Have |

**Sprint 1 Total**: 21 points

### Sprint 2: Advanced Configuration & Integration

| Story ID | Title | Points | Status | Priority |
|----------|-------|--------|--------|----------|
| AG-TBD-005 | [Create Vite ESM externals configuration](./AG-TBD-005-esm-externals-configuration.md) | 5 | 📋 | Must Have |
| AG-TBD-006 | [Implement multi-environment builds for Vite](./AG-TBD-006-multi-environment-builds.md) | 8 | 📋 | Must Have |
| AG-TBD-007 | [Set up Vite testing infrastructure](./AG-TBD-007-vite-testing-infrastructure.md) | 5 | 📋 | Must Have |

**Sprint 2 Total**: 18 points

### Sprint 3: Validation & Tooling

| Story ID | Title | Points | Status | Priority |
|----------|-------|--------|--------|----------|
| AG-TBD-008 | [Migrate pilot SPA to Vite](./AG-TBD-008-pilot-spa-migration.md) | 8 | 📋 | Must Have |
| AG-TBD-009 | [Create build comparison tooling](./AG-TBD-009-build-comparison-tooling.md) | 3 | 📋 | Should Have |
| AG-TBD-010 | [Performance benchmarking suite](./AG-TBD-010-performance-benchmarking.md) | 5 | 📋 | Should Have |

**Sprint 3 Total**: 16 points

**Phase Total**: 55 points

## Dependencies Flow

```
AG-TBD-001 (Vite Base Config)
    ↓
    ├── AG-TBD-002 (GuruBuildManifest Plugin)
    │       ↓
    ├── AG-TBD-003 (TranslationHashing Plugin)
    │       ↓
    ├── AG-TBD-004 (CLI Flag Support)
    │       ↓
    └── AG-TBD-005 (ESM Externals)
            ↓
        AG-TBD-006 (Multi-Environment Builds)
            ↓
        AG-TBD-007 (Testing Infrastructure)
            ↓
        AG-TBD-008 (Pilot SPA Migration) ←─┬─ AG-TBD-009 (Comparison Tool)
                                            └─ AG-TBD-010 (Benchmarking)
```

## Key Features by Story

### Configuration Foundation
- **AG-TBD-001**: Base Vite configuration with multi-environment support
- **AG-TBD-005**: ESM externals for React (ESM.sh CDN integration)
- **AG-TBD-006**: Parallel multi-environment builds (dev, test, uat, preprod, prod, dockerprod, shared)

### Build System Integration
- **AG-TBD-002**: Build manifest generation (MFE orchestrator compatibility)
- **AG-TBD-003**: Translation file hashing and package auto-discovery
- **AG-TBD-004**: CLI flag to choose webpack or Vite

### Quality & Validation
- **AG-TBD-007**: Comprehensive testing infrastructure (unit, integration, comparison)
- **AG-TBD-008**: Real-world pilot migration with monitoring
- **AG-TBD-009**: Automated build comparison tooling
- **AG-TBD-010**: Performance benchmarking and historical tracking

## Success Criteria

### Sprint 1
- ✅ Vite can build a basic SPA with all plugins functional
- ✅ Build manifest structure matches webpack exactly
- ✅ Translations are hashed and discovered automatically
- ✅ Developers can switch bundlers via CLI flag

### Sprint 2
- ✅ React is externalized to ESM.sh CDN (bundle size reduction >140KB)
- ✅ All 7 environments build successfully in parallel
- ✅ Comprehensive test suite with >80% coverage
- ✅ CI/CD pipeline validates Vite builds

### Sprint 3
- ✅ Pilot SPA runs in production for 1 week without issues
- ✅ Build comparison tooling validates webpack/Vite equivalence
- ✅ Performance benchmarks show Vite is 2x+ faster than webpack
- ✅ Team confident in broader Vite rollout

## Technical Highlights

### Build Performance Targets
- **Build Time**: < 30s for typical MFE (webpack: ~60s)
- **Bundle Size**: Within ±15% of webpack (accounting for different optimisations)
- **Memory Usage**: < 4GB for parallel multi-environment builds

### Compatibility Requirements
- ✅ Build manifest structure 100% identical to webpack
- ✅ MFE orchestrator loads Vite-built MFEs without changes
- ✅ i18n system works identically (auto-discovery, hashing, manifests)
- ✅ CDN externals pattern preserved (ESM.sh for React)

### Quality Gates
- ✅ Unit test coverage >80%
- ✅ All integration tests passing
- ✅ Comparison tests validate webpack parity
- ✅ Performance benchmarks meet targets
- ✅ Pilot SPA validation successful

## Migration Strategy

### Phase 1-2: Foundation (This Directory)
**Timeline**: Sprints 1-3
**Focus**: Infrastructure, tooling, validation
**Outcome**: Vite production-ready for MFE builds

### Phase 3: Gradual Rollout (Future)
**Timeline**: Sprints 4-8
**Focus**: Migrate MFEs incrementally (internal → external)
**Outcome**: 50%+ of MFEs on Vite

### Phase 4: React Router 7 (Future)
**Timeline**: Sprints 9-12
**Focus**: SSR with React Router 7, development mode
**Outcome**: Full stack modernisation

## Resources

### Documentation
- [Vite Documentation](https://vitejs.dev/)
- [Rollup Plugin API](https://rollupjs.org/plugin-development/)
- [ESM.sh Documentation](https://esm.sh/)

### Internal References
- `/packages/gdu/config/webpack/` - Current webpack configuration
- `/packages/gdu/commands/build/` - Build command implementation
- Confluence: GDU Build Tooling Migration RFC

### Team Contacts
- **Tech Lead**: [Name]
- **Platform Engineer**: [Name]
- **DevOps**: [Name]

## Story Template

Each story follows the AutoGuru user story template with:
- Clear title and description
- User persona and value statement
- Detailed acceptance criteria (functional, non-functional, edge cases)
- Technical implementation details
- Test scenarios
- Definition of done
- Dependencies
- Story points justification

## Getting Started

1. **Sprint Planning**: Review stories in sprint order
2. **Technical Context**: Read AG-TBD-001 first for foundation understanding
3. **Implementation**: Follow dependency flow (implement blockers first)
4. **Testing**: Set up AG-TBD-007 testing infrastructure early
5. **Validation**: Use AG-TBD-009 and AG-TBD-010 throughout development

## Questions or Feedback?

- **Slack**: #gdu-build-tooling
- **Email**: platform-engineering@autoguru.com
- **Office Hours**: Wednesdays 2pm AEST

---

**Last Updated**: 2025-12-15
**Version**: 1.0
**Status**: Ready for Sprint Planning
