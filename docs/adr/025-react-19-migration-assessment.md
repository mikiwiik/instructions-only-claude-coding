# ADR-025: React 19 Migration Assessment

## Status

Accepted

**Date**: October 19, 2025
**Issue**: #223
**Current Versions**: React 18.3.1, Next.js 14.2.33
**Target Versions**: React 19.2.0, Next.js 15.5.6

## Executive Summary

This report assesses the feasibility and requirements for migrating from React 18.3.1 to React 19.2.0,
including the necessary upgrade to Next.js 15.5.6. The assessment concludes that **migration is
RECOMMENDED and FEASIBLE** with careful attention to dependency updates and Next.js framework upgrade.

### Recommendation: ✅ **GO - Proceed with Migration**

## 1. React 19 Breaking Changes Analysis

### 1.1 Deprecated APIs Removed

| API                                    | Impact on Our Codebase | Action Required |
| -------------------------------------- | ---------------------- | --------------- |
| `propTypes`                            | ❌ Not used            | None            |
| `defaultProps` for function components | ❌ Not used            | None            |
| String refs                            | ❌ Not used            | None            |
| `react-test-renderer`                  | ❌ Not used            | None            |

**Verdict**: ✅ No breaking changes affect our codebase.

### 1.2 TypeScript Type Changes

| Change                                    | Impact               | Action Required                        |
| ----------------------------------------- | -------------------- | -------------------------------------- |
| `useRef` requires argument                | ✅ Already compliant | None - using `useRef<T>(null)` pattern |
| `ReactElement` props default to `unknown` | ⚠️ Potential impact  | Review during upgrade                  |
| JSX namespace scoped to `React.JSX`       | ⚠️ Potential impact  | May require TypeScript config update   |

**Verdict**: ⚠️ Minor TypeScript adjustments may be needed during upgrade.

### 1.3 New Features (Optional)

- ✨ `useEffectEvent` hook - Can adopt incrementally
- ✨ `<Activity />` component - Not immediately needed
- ✨ React Compiler (automatic memoization) - Experimental, consider for future

## 2. Next.js Compatibility Assessment

### 2.1 Current Situation

**Current**: Next.js 14.2.33
**Target**: Next.js 15.5.6 (latest stable)

### 2.2 Next.js and React 19 Compatibility

| Next.js Version | React 19 Support            | Status            |
| --------------- | --------------------------- | ----------------- |
| 14.x            | ❌ Not officially supported | Not recommended   |
| 15.0+           | ✅ RC support               | Available         |
| 15.1+           | ✅ Stable React 19 support  | **Recommended**   |
| 15.5.6          | ✅ Full React 19 support    | **Latest stable** |

**Key Findings**:

- Next.js 14 with React 19 is **not officially supported** and may cause compatibility issues
- Next.js 15.1+ provides **full official support** for React 19 stable
- Next.js 15.5.6 is the **latest stable version** (as of October 2025)
- Next.js 16.0.0 is in beta/canary (not recommended for production)

### 2.3 Next.js 15 Migration Implications

**New Features** in Next.js 15:

- Turbopack development (stable)
- `after()` API for post-response execution
- Improved error debugging with better source maps
- React Compiler support (experimental)
- Enhanced caching controls

**Breaking Changes** to review:

- Caching behavior changes in App Router
- Some configuration option changes
- Potential build/deployment adjustments

**Action Required**: ✅ Review Next.js 15 migration guide during upgrade

## 3. Dependency Compatibility Analysis

### 3.1 Critical Dependencies

#### @testing-library/react

**Current**: 16.3.0
**React 19 Peer Dependency**: `^18.0.0 || ^19.0.0`

✅ **COMPATIBLE** - Latest version (16.3.0) supports both React 18 and 19

#### react-markdown

**Current**: 10.1.0
**React 19 Peer Dependency**: `>=18`

✅ **COMPATIBLE** - Version 9.0.2+ includes React 19 type fixes
✅ Current version 10.1.0 fully supports React 19

#### @dnd-kit/core

**Current**: 6.3.1
**React 19 Peer Dependency**: `>=16.8.0`

⚠️ **POTENTIALLY INCOMPATIBLE** - Major blocker

**Issues**:

- @dnd-kit/core 6.3.1 last published 10 months ago
- Does NOT officially list React 19 in peer dependencies
- Open GitHub issue #1511 requesting React 19 support (66+ reactions)
- Library maintenance concerns raised in issue #1194

**Workarounds**:

1. Use `--legacy-peer-deps` or `--force` during npm install (risky)
2. Wait for official React 19 support from @dnd-kit
3. Consider alternative drag-and-drop libraries
4. Test thoroughly if using workarounds

**Recommendation**: ⚠️ This is the **primary blocker** for React 19 migration

### 3.2 Other React Dependencies

| Package                | Current Version | React 19 Compatible | Notes                                |
| ---------------------- | --------------- | ------------------- | ------------------------------------ |
| lucide-react           | 0.545.0         | ✅ Yes              | Generic dependency, should work      |
| @vercel/speed-insights | 1.2.0           | ✅ Yes              | Vercel packages track React versions |
| @types/react           | 18.3.24         | ⬆️ Needs update     | Update to 19.x                       |
| @types/react-dom       | 18.3.7          | ⬆️ Needs update     | Update to 19.x                       |

### 3.3 DevDependencies

| Package                     | Current Version | React 19 Compatible | Notes                         |
| --------------------------- | --------------- | ------------------- | ----------------------------- |
| @testing-library/jest-dom   | 6.9.1           | ✅ Yes              | Testing utility               |
| @testing-library/user-event | 14.6.1          | ✅ Yes              | Testing utility               |
| eslint-plugin-react         | 7.37.5          | ⚠️ Review           | May need update               |
| eslint-plugin-react-hooks   | 7.0.0           | ⚠️ Review           | React 19 ships updated plugin |
| eslint-config-next          | 15.5.5          | ✅ Yes              | Matches Next.js 15.5.x        |

## 4. Codebase Impact Assessment

### 4.1 Component Patterns

**Scanned**: 60+ TypeScript files in `app/` directory

| Pattern                                        | Usage in Codebase        | React 19 Compatible        |
| ---------------------------------------------- | ------------------------ | -------------------------- |
| Function components with TypeScript interfaces | ✅ Widespread            | ✅ Yes                     |
| `useRef` with type annotations                 | ✅ Used correctly        | ✅ Yes - already compliant |
| Hooks (useState, useEffect, etc.)              | ✅ Standard usage        | ✅ Yes                     |
| Custom hooks                                   | ✅ Multiple custom hooks | ✅ Yes                     |
| Class components                               | ❌ Not used              | ✅ N/A                     |
| propTypes                                      | ❌ Not used              | ✅ N/A                     |
| defaultProps                                   | ❌ Not used              | ✅ N/A                     |
| String refs                                    | ❌ Not used              | ✅ N/A                     |

**Verdict**: ✅ **Codebase is React 19-ready from a patterns perspective**

### 4.2 Testing Infrastructure

**Current Setup**:

- ✅ Using `@testing-library/react` (not deprecated `react-test-renderer`)
- ✅ Jest with jsdom environment
- ✅ 93% test coverage (exceeds 90% threshold)
- ✅ 730 tests across components, hooks, integration, and security

**React 19 Impact**: ✅ Minimal - testing library already compatible

## 5. Migration Strategy

### 5.1 Recommended Approach

#### Phase 1: Dependency Assessment (CURRENT)

✅ Research React 19 breaking changes
✅ Verify package compatibility
✅ Assess codebase patterns
✅ Create migration plan

#### Phase 2: Preparation

1. Create ADR for React 19 + Next.js 15 migration decision
2. Update documentation with migration strategy
3. Communicate timeline and potential risks

#### Phase 3: Address @dnd-kit Blocker (CRITICAL)

**Option A**: Wait for official support

- Monitor @dnd-kit GitHub issues
- Test with React 19 once support is added
- Timeline: Unknown

**Option B**: Use workaround (risky)

- Install with `--legacy-peer-deps`
- Comprehensive testing of drag-and-drop functionality
- Accept potential instability
- Document workaround in codebase

**Option C**: Replace library (high effort)

- Research alternative drag-and-drop libraries
- Implement migration to new library
- Update all affected components
- Timeline: 2-4 weeks

**RECOMMENDATION**: **Option A** (wait for official support) OR **Option B** (careful testing with workaround)

#### Phase 4: Upgrade Execution

1. **Update package.json**:

   ```json
   {
     "dependencies": {
       "react": "19.2.0",
       "react-dom": "19.2.0",
       "next": "15.5.6"
     },
     "devDependencies": {
       "@types/react": "19.0.0",
       "@types/react-dom": "19.0.0"
     }
   }
   ```

2. **Install dependencies**:

   ```bash
   npm install --legacy-peer-deps  # If using Option B for @dnd-kit
   ```

3. **Run automated codemods** (if needed):

   ```bash
   npx codemod@latest react/19/migration-recipe
   npx types-react-codemod@latest preset-19 ./app
   ```

4. **Update TypeScript configuration** (if needed):
   - Review `tsconfig.json` for JSX namespace changes
   - Adjust any React-specific type imports

5. **Test comprehensively**:
   - Run full test suite: `npm run test`
   - Type check: `npm run type-check`
   - Lint: `npm run lint`
   - Build: `npm run build`
   - Manual testing of all features

6. **Update documentation**:
   - Update README with new versions
   - Document any migration notes
   - Update contribution guidelines if needed

#### Phase 5: Deployment & Monitoring

1. Deploy to staging/preview environment
2. Verify Vercel build succeeds
3. Test deployed application thoroughly
4. Monitor for runtime errors
5. Deploy to production
6. Monitor performance and error tracking

### 5.2 Rollback Plan

If issues arise:

1. Revert package.json changes
2. Run `npm install` to restore React 18 + Next.js 14
3. Restore any code changes (git revert)
4. Document issues encountered
5. Reassess migration timeline

## 6. Risk Assessment

### 6.1 High Risk

- ⚠️ **@dnd-kit/core compatibility** - Primary blocker
  - Mitigation: Comprehensive testing, consider workarounds or alternatives

### 6.2 Medium Risk

- ⚠️ **Next.js 15 breaking changes** - Framework upgrade required
  - Mitigation: Review Next.js 15 migration guide, test thoroughly
  - Mitigation: Staging environment testing before production

- ⚠️ **TypeScript type adjustments** - May require code changes
  - Mitigation: Use automated codemods, manual review

### 6.3 Low Risk

- ✅ **React 19 API changes** - Codebase already compliant
- ✅ **Testing infrastructure** - Already using compatible libraries
- ✅ **Component patterns** - No deprecated patterns in use

### 6.4 Overall Risk Level

**MEDIUM** - Primarily due to @dnd-kit dependency and Next.js framework upgrade

## 7. Timeline Estimation

| Phase                   | Duration | Dependencies                              |
| ----------------------- | -------- | ----------------------------------------- |
| Decision & Planning     | 1 day    | This assessment                           |
| @dnd-kit resolution     | Unknown  | Library maintainers OR workaround testing |
| Migration execution     | 2-3 days | @dnd-kit resolution                       |
| Testing & validation    | 2-3 days | Migration execution                       |
| Documentation updates   | 1 day    | Migration execution                       |
| Deployment & monitoring | 1-2 days | Testing completion                        |

**Total**: 1-2 weeks (assuming @dnd-kit resolution)

## 8. Recommendations

### 8.1 Immediate Actions

1. ✅ **Monitor @dnd-kit/core** for React 19 support
   - Subscribe to GitHub issue #1511
   - Check for new releases

2. ✅ **Create ADR** for migration decision
   - Document rationale for upgrading
   - Document @dnd-kit blocker and chosen approach

3. ✅ **Test @dnd-kit workaround** (if going with Option B)
   - Create test branch
   - Install React 19 + Next.js 15 with `--legacy-peer-deps`
   - Run comprehensive drag-and-drop testing
   - Document findings

### 8.2 Long-term Strategy

1. ✅ **Stay on latest stable versions**
   - React 19.2.0
   - Next.js 15.5.6 (or latest 15.x)

2. ✅ **Monitor dependency health**
   - Evaluate libraries for active maintenance
   - Consider alternatives for unmaintained dependencies

3. ✅ **Adopt new React 19 features incrementally**
   - `useEffectEvent` for event handlers
   - React Compiler (when stable)
   - Performance optimizations

## 9. Conclusion

**Migration from React 18.3.1 to React 19.2.0 is RECOMMENDED and FEASIBLE**, pending resolution of the
@dnd-kit/core compatibility issue.

### Decision

✅ **GO - Proceed with migration**

### Critical Path

1. Resolve @dnd-kit/core compatibility (blocker)
2. Upgrade to Next.js 15.5.6 + React 19.2.0
3. Comprehensive testing
4. Documentation updates
5. Staged deployment

### Success Criteria

- ✅ All tests passing (90%+ coverage maintained)
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ Successful production build
- ✅ Drag-and-drop functionality working correctly
- ✅ No performance regressions
- ✅ Documentation updated

---

**Prepared by**: AI Agent (Claude Code)
**Issue**: #223
**Branch**: feature/223-react-19-migration-assessment
