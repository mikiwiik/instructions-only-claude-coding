# ADR-029: E2E Testing Framework Selection

## Status

Accepted

## Context

The project currently has comprehensive unit and integration testing using Jest and React Testing Library
(per ADR-006), achieving 90%+ code coverage. However, there is no end-to-end (E2E) testing to
validate complete user workflows in a real browser environment.

### Gap Analysis

**What's Missing**:

- No validation of full user journeys (add → complete → delete → persist)
- No browser automation or real DOM testing
- No multi-tab/session testing capabilities
- No testing against production-like builds
- No cross-browser compatibility validation

### Requirements

**Technical Factors**:

- Next.js 14 compatibility
- TypeScript support (project uses strict TypeScript)
- GitHub Actions integration (existing CI/CD pipeline)
- Node.js 22.x compatibility (current environment)
- Local development experience (debugging, test development)

**Learning Factors**:

- Documentation quality and community support
- Ease of setup and maintenance
- Industry adoption and best practices
- Alignment with educational project goals

**Budget Constraints**:

- Free tier must support all features
- No paid services for core functionality (parallel execution, etc.)
- CI/CD efficiency to minimize GitHub Actions minutes

## Decision

Implement **Playwright** as the E2E testing framework for the Todo application.

### Framework Comparison

Evaluated three primary options: Playwright, Cypress, and TestCafe.

| Criteria                     | Playwright                   | Cypress                      | TestCafe          |
| ---------------------------- | ---------------------------- | ---------------------------- | ----------------- |
| **Next.js Support**          | Excellent (official example) | Excellent (official example) | Good              |
| **TypeScript**               | Native, out-of-box           | Native, excellent            | Native            |
| **Browser Coverage**         | Chromium, Firefox, WebKit    | Chrome, Firefox\*, Edge      | All major         |
| **Parallel Execution**       | Native, free                 | Dashboard service (paid)     | Built-in          |
| **Speed**                    | 35-45% faster                | Baseline                     | Moderate          |
| **CI/CD Integration**        | Excellent                    | Excellent                    | Good              |
| **Setup Complexity**         | Low (`npm init playwright`)  | Low                          | Moderate          |
| **Learning Curve**           | Gentle                       | Gentle                       | Moderate          |
| **Debugging DX**             | Excellent (trace viewer, UI) | Excellent (time-travel)      | Good              |
| **Documentation**            | Excellent                    | Excellent                    | Good              |
| **Industry Adoption (2025)** | 5M weekly downloads, rising  | Mature, established          | Smaller niche     |
| **GitHub Actions**           | Official action available    | Official action available    | Community         |
| **Free Tier**                | Fully free, open source      | Free (Dashboard paid)        | Free, open source |

\*Cypress Firefox support remains experimental; WebKit not supported

### Scoring Matrix

**Technical Compatibility** (Playwright: 95/100, Cypress: 85/100):

- Next.js official support: ✅ Both
- TypeScript support: ✅ Both
- GitHub Actions integration: ✅ Both
- Cross-browser testing: ✅ Playwright, ⚠️ Cypress (no WebKit)
- Parallel execution: ✅ Playwright (free), ⚠️ Cypress (paid)

**Performance** (Playwright: 95/100, Cypress: 70/100):

- Execution speed: ✅ Playwright 35-45% faster
- Parallel execution: ✅ Playwright (free), ⚠️ Cypress (paid)
- Resource usage: ✅ Playwright (lower memory)
- CI/CD efficiency: ✅ Playwright

**Developer Experience** (Cypress: 90/100, Playwright: 85/100):

- Setup complexity: ✅ Both (one command)
- Debugging tools: ✅ Both excellent
- Documentation: ✅ Both excellent
- Learning curve: ✅ Both gentle

**Educational Value** (Playwright: 90/100, Cypress: 85/100):

- Industry adoption: ✅ Playwright (growing momentum)
- Modern tooling: ✅ Playwright
- Documentation quality: ✅ Both
- Learning transferability: ✅ Both

**Cost Efficiency** (Playwright: 100/100, Cypress: 70/100):

- Free tier: ✅ Both
- Parallel execution: ✅ Playwright (free), ❌ Cypress (paid $75/month)
- CI minutes usage: ✅ Playwright (faster = fewer minutes)

**Final Scores**:

- **Playwright**: 93/100
- **Cypress**: 82/100
- **TestCafe**: 75/100

### Rationale

1. **Official Next.js Recommendation**: Next.js documentation lists Playwright first with official integration example
2. **Superior Performance**: 35-45% faster execution, critical for CI/CD efficiency and developer feedback loops
3. **Complete Browser Coverage**: WebKit support enables Safari testing, providing comprehensive cross-browser validation
4. **Free Parallelization**: Native process-based parallel execution without external services (Cypress requires paid Dashboard)
5. **Cost Effectiveness**: Fully free with no feature limitations, better for educational project budget
6. **Industry Momentum**: Rising adoption (5M weekly downloads in 2025), preparing for modern testing standards
7. **CI/CD Efficiency**: Lower resource usage and faster execution reduce GitHub Actions minutes consumption
8. **Long-term Viability**: Active development, growing community, ESLint's official direction

### Implementation Scope

**E2E Test Coverage** (based on `docs/diagrams/user-flows.md`):

**Tier 1 - Critical Paths** (Release Blockers):

1. Add todo (Enter + button)
2. Complete todo (circle click)
3. Data persistence (reload page)

**Tier 2 - Standard Features**:

- Edit todo
- Delete todo (soft delete)
- Undo completion
- Filter functionality (All, Active, Completed)

**Tier 3 - Extended Features**:

- Activity timeline
- Recently Deleted
- Markdown rendering
- Responsive design validation

### Testing Strategy

**Test Organization**:

- Page Object Model (POM) pattern for maintainability
- Independent tests with no dependencies
- Type-safe interactions with TypeScript
- Descriptive test names following project conventions

**Test Execution**:

- **Local Development**: Headed mode with UI for debugging
- **CI/CD Pipeline**: Chromium-only headless for speed
- **Cross-Browser**: Full suite (Chromium + Firefox + WebKit) on main branch merges
- **Parallel Execution**: 4 workers on local, CI optimized
- **Retry Strategy**: 2 retries on CI for flaky test resilience

**Performance Targets**:

- E2E suite completes in < 5 minutes on CI
- No flaky tests (pass rate > 98%)
- Zero false negatives in main branch

## Consequences

### Positive

- **Next.js 16 Compatibility**: Official support ensures compatibility with current and future
  Next.js versions
- **Comprehensive Testing**: Complete user flow validation catches integration bugs unit tests miss
- **Cross-Browser Coverage**: WebKit support validates Safari compatibility (important for iOS users)
- **Cost Effective**: Zero licensing costs with full feature access (parallel execution, all browsers)
- **CI/CD Efficiency**: Faster execution (35-45%) reduces pipeline duration and GitHub Actions costs
- **Better Control**: Native parallel execution without external service dependencies
- **Educational Value**: Modern framework aligns with 2025+ industry standards
- **Maintainability**: Page Object Model and TypeScript provide clear, type-safe test structure
- **Debugging Excellence**: Trace viewer and UI mode provide powerful debugging capabilities

### Negative

- **Additional CI Time**: E2E tests add 2-5 minutes to pipeline (mitigated by running in parallel)
- **Maintenance Overhead**: E2E tests require updates when UI changes (mitigated by POM pattern)
- **Learning Curve**: Team needs to learn Playwright API (mitigated by excellent documentation)
- **Browser Binary Storage**: Playwright downloads browser binaries (~300MB, one-time cost)
- **Flaky Test Risk**: E2E tests can be flaky if not properly designed (mitigated by retry strategy, explicit waits)

### Neutral

- **Test Suite Growth**: E2E tests increase total test count (expected for comprehensive coverage)
- **Configuration Complexity**: Additional config files needed (standard for any E2E framework)
- **Development Workflow**: Adds new test commands (`test:e2e`, `test:e2e:ui`, etc.)

## Alternatives Considered

### Cypress

**Strengths**:

- Excellent time-travel debugging
- Simpler mental model (runs inside browser)
- Stronger visual feedback during development
- More mature ecosystem with extensive community resources
- Better for rapid feedback during development

**Rejected Because**:

- **Paid Parallelization**: Requires Dashboard service ($75/month) for parallel execution
- **Browser Limitations**: No WebKit support, experimental Firefox
- **Performance**: 35-45% slower execution impacts CI/CD efficiency
- **Resource Usage**: Higher memory consumption
- **Industry Trend**: Growth plateaued while Playwright accelerates

**Verdict**: Excellent framework, but cost and performance constraints favor Playwright for this project.

### TestCafe

**Strengths**:

- No browser plugins required
- Built-in parallel execution
- Good for enterprise environments
- Works with all major browsers

**Rejected Because**:

- **Smaller Ecosystem**: Less community support and fewer examples
- **Less Next.js Integration**: Fewer Next.js-specific examples and documentation
- **Moderate Setup**: More complex configuration vs. Playwright/Cypress
- **Lower Adoption**: Smaller user base limits community resources

**Verdict**: Solid framework, but smaller ecosystem and less Next.js integration favor Playwright.

### Puppeteer

**Strengths**:

- Lower-level browser automation
- Smaller API surface
- Good for Chrome-specific scenarios

**Rejected Because**:

- **Chrome-Only**: No Firefox or WebKit support
- **Declining Adoption**: Playwright has surpassed Puppeteer in adoption
- **Lower-Level API**: More verbose for E2E testing scenarios
- **Less Testing-Focused**: Built for browser automation, not specifically testing

**Verdict**: Playwright is built by the same team and provides all Puppeteer features plus more.

### Nightwatch.js

**Strengths**:

- Mature framework with long history
- W3C WebDriver protocol
- Good cross-browser support

**Rejected Because**:

- **Legacy Technology**: Less modern tooling vs. Playwright
- **Smaller Community**: Limited resources and examples
- **Setup Complexity**: More configuration required
- **Lower Industry Adoption**: Declining usage in favor of Playwright/Cypress

**Verdict**: Legacy framework with less momentum than modern alternatives.

### Selenium WebDriver

**Strengths**:

- Industry standard for decades
- Extensive cross-browser support
- Large ecosystem

**Rejected Because**:

- **Verbose API**: More boilerplate code required
- **Slower Execution**: Significantly slower than Playwright
- **Legacy Technology**: Older architecture vs. modern frameworks
- **Setup Complexity**: More configuration overhead

**Verdict**: Legacy technology superseded by modern frameworks like Playwright.

## Implementation

### Setup Steps

1. **Install Playwright**: `npm init playwright@latest`
2. **Configure** `playwright.config.ts`:
   - Base URL: `http://localhost:3000`
   - Browsers: chromium, firefox, webkit
   - Parallel workers: 4
   - Retry strategy: 2 on CI
   - Screenshots/videos on failure
   - Trace collection for debugging

3. **Create Test Infrastructure**:
   - `e2e/pages/todo-page.ts` - Page Object Model
   - `e2e/fixtures/test-data.ts` - Test fixtures
   - `e2e/utils/helpers.ts` - Helper functions

4. **Implement Core Tests**:
   - `e2e/tests/add-todo.spec.ts`
   - `e2e/tests/complete-todo.spec.ts`
   - `e2e/tests/persistence.spec.ts`
   - `e2e/tests/edit-todo.spec.ts`
   - `e2e/tests/delete-todo.spec.ts`
   - `e2e/tests/filter-todos.spec.ts`

5. **CI/CD Integration**:
   - Update `.github/workflows/build.yml`
   - Add E2E test job after build
   - Install Playwright browsers
   - Run tests against production build
   - Upload artifacts on failure

6. **Documentation**:
   - Create `docs/testing/e2e-testing-guide.md`
   - Update `README.md` with E2E commands
   - Update `CLAUDE.md` with E2E standards

### Configuration Files

**New Files**:

- `playwright.config.ts` - Main configuration
- `e2e/**/*.ts` - Tests, pages, fixtures, utilities
- `docs/testing/e2e-testing-guide.md` - Documentation

**Modified Files**:

- `package.json` - Add dependencies and scripts
- `tsconfig.json` - Add Playwright types
- `.gitignore` - Add Playwright artifacts
- `.github/workflows/build.yml` - Add E2E test job
- `README.md` - Add E2E testing section
- `CLAUDE.md` - Add E2E quality standards

## Validation

### Success Criteria

✅ All critical user flows covered (Tier 1)
✅ E2E tests integrated into CI/CD pipeline
✅ Tests run reliably (>98% pass rate)
✅ Complete documentation for local development
✅ Cross-browser testing validated (Chromium, Firefox, WebKit)
✅ Performance target met (< 5 minutes on CI)

## References

- **Issue**: #29
- **Next.js Testing Docs**: <https://nextjs.org/docs/app/building-your-application/testing/playwright>
- **Playwright Documentation**: <https://playwright.dev>
- **Related ADRs**:
  - ADR-004: Test-Driven Development
  - ADR-006: Testing Framework Choice (Jest + RTL)
  - ADR-011: CI/CD Pipeline Choice (GitHub Actions)
- **User Flows**: `docs/diagrams/user-flows.md`
- **Performance Benchmarks**: 2025 Playwright vs Cypress comparative analysis
