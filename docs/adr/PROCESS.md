# Architecture Decision Records (ADR) Process

This document defines the mandatory process for creating and maintaining Architecture Decision Records (ADRs) in this project.

## 🚨 CRITICAL REQUIREMENT

## ALL MAJOR ARCHITECTURAL CHANGES MUST BE DOCUMENTED AS ADRs

This is a non-negotiable requirement for maintaining project knowledge and ensuring informed decision-making.

## When to Create ADRs

Create an ADR whenever making decisions about:

### Technology and Framework Decisions

- **Framework and library choices** (React frameworks, UI libraries, state management)
- **Development tools** (build tools, linters, formatters, testing frameworks)
- **Third-party dependencies** (adding significant new libraries or services)
- **Language and runtime decisions** (TypeScript settings, Node.js versions)

### Architecture and Design Decisions

- **Architecture patterns** (component structure, data flow, API design)
- **Code organization** (folder structure, module boundaries, naming conventions)
- **State management strategies** (local vs global state, persistence approaches)
- **API design patterns** (REST vs GraphQL, request/response formats)

### Development and Operations Decisions

- **Development practices** (testing strategies, code review processes, deployment)
- **Security approaches** (authentication methods, data protection, access control)
- **Performance strategies** (optimization approaches, caching, bundling)
- **Database and storage decisions** (persistence strategies, data modeling)

## ADR Process

### 1. Before Implementation

- **Create ADR first**: Document the decision before writing code
- **Status "Proposed"**: Start with proposed status for review
- **Consider alternatives**: Research and document other options

### 2. Documentation Standards

- **Use template**: Always start with `docs/adr/template.md`
- **Sequential numbering**: Use next available number (###-title.md)
- **Descriptive titles**: Clear, specific titles in kebab-case
- **Complete context**: Explain why the decision is needed

### 3. Decision Process

- **Document alternatives**: List and evaluate other options considered
- **State decision clearly**: Be specific about what was chosen
- **Explain rationale**: Why this option was selected
- **List consequences**: Both positive and negative impacts

### 4. Finalization

- **Update status**: Change to "Accepted" when decision is final
- **Update index**: Add entry to `docs/adr/README.md` table
- **Reference in commits**: Link ADR in related git commits

## ADR Location and Naming

- **Directory**: `docs/adr/`
- **Template**: Use `docs/adr/template.md`
- **Naming**: `###-kebab-case-title.md` (e.g., `009-api-client-library.md`)
- **Numbering**: Sequential, starting from 001

### Naming Convention

ADRs follow a strict naming pattern with distinct filename and header formats:

**Filename format**: `###-kebab-case-title.md`

- Sequential three-digit number (e.g., `001`, `015`, `023`)
- Kebab-case title describing the decision
- Examples:
  - `001-nextjs-app-router.md`
  - `015-ai-agent-attribution-strategy.md`
  - `023-component-isolation-testing.md`

**Header format**: `# ADR-###: Title`

- "ADR-" prefix followed by the number
- Colon separator
- Descriptive title in sentence case
- Examples:
  - `# ADR-001: Use Next.js 14 with App Router`
  - `# ADR-015: AI Agent Attribution Strategy`
  - `# ADR-023: Component Isolation Testing Strategy`

**Important**: Notice the distinction - filenames use simple numbers (`015-`), while headers include the "ADR-" prefix
(`ADR-015:`). This maintains consistency across the codebase.

## Example Scenarios Requiring ADRs

### Adding New Features

```markdown
# Before adding authentication

→ ADR: Authentication strategy (OAuth vs JWT vs sessions)

# Before adding animations

→ ADR: Animation library choice (Framer Motion vs React Spring vs CSS)

# Before adding forms

→ ADR: Form validation approach (Yup vs Zod vs React Hook Form)
```

### Changing Architecture

```markdown
# Before changing state management

→ ADR: Migration from hooks to Redux (why and how)

# Before adding API layer

→ ADR: API client architecture (fetch vs Axios vs SWR)

# Before restructuring files

→ ADR: File organization principles (feature-based vs type-based)
```

### Adding Dependencies

```markdown
# Before adding UI components

→ ADR: Component library choice (Headless UI vs Material-UI vs custom)

# Before adding date handling

→ ADR: Date library selection (date-fns vs dayjs vs native Date)

# Before adding testing utilities

→ ADR: Testing strategy evolution (unit vs integration focus)
```

## Quality Standards

### Required ADR Sections

- **Status**: Current state (Proposed/Accepted/Deprecated/Superseded)
- **Context**: Situation requiring the decision
- **Decision**: What was chosen
- **Consequences**: Positive, negative, and neutral impacts
- **Alternatives**: Other options considered

### Optional but Recommended

- **References**: Links to documentation, discussions, research
- **Implementation notes**: Specific technical details
- **Migration path**: How to transition from previous approach

## Enforcement

### Automated Checks

- All commits introducing new dependencies must reference an ADR
- Architecture changes require ADR creation before code review
- Pull requests should link to relevant ADRs

### Review Process

- ADRs should be reviewed by team members before acceptance
- Consider consequences and alternatives during review
- Update status only after consensus

## ADR Immutability and Evolution

### Principle: ADRs Are Historical Records

Architecture Decision Records document decisions **at the time they were made**. They serve as historical context for
understanding why the architecture evolved the way it did.

**Core Principle**: Once an ADR is accepted and merged, it should NOT be modified to reflect current architecture.

### When Changes Are Acceptable

**Minor corrections** (without changing meaning):

- ✅ Typo fixes
- ✅ Broken link updates
- ✅ Formatting corrections
- ✅ Grammar improvements
- ✅ Status field updates (when superseded or amended)

**NOT acceptable**:

- ❌ Adding new information about current state
- ❌ Modifying decisions to reflect current architecture
- ❌ Updating consequences based on new knowledge
- ❌ Adding new alternatives that weren't considered originally

### Handling Architectural Changes

When architecture evolves, create a **new ADR** that:

1. References the original ADR
2. Explains what changed and why
3. Documents the new decision with current context
4. Updates the original ADR's status field only

**Example**: If ADR-011 (CI/CD) needs updating for security scanning:

- ❌ Don't edit ADR-011 to add security scanning info
- ✅ Create ADR-026 "Security Scanning in CI/CD Pipeline"
- ✅ Add "Status: Amended by ADR-026" to ADR-011

### ADR Status Values

- **Proposed**: Under discussion, not yet accepted
- **Accepted**: Decision made and implemented
- **Deprecated**: No longer recommended, but not replaced
- **Superseded by ADR-XXX**: Replaced by newer decision
- **Amended by ADR-XXX**: Extended or modified by newer decision
- **Rejected**: Considered but not adopted

### Superseding vs. Amending

**Superseding** (complete replacement):

```markdown
Status: Superseded by ADR-025
```

Example: Switching from LocalStorage to Backend API (complete architectural change)

**Amending** (extension or modification):

```markdown
Status: Amended by ADR-026
```

Example: Adding security scanning to existing CI/CD pipeline (extending existing architecture)

### Before Creating a New ADR

**IMPORTANT**: Always check existing ADR numbers to avoid duplicates

```bash
# List all existing ADRs sorted by number
ls docs/adr/0*.md | sort

# Or use the validation script
./scripts/validate-adrs.sh
```

This prevents duplicate numbering and ensures sequential ADR numbers.

## Maintenance

### Updating ADRs

- ADRs are **immutable** once accepted (see "ADR Immutability and Evolution" above)
- Create new ADR to supersede previous decisions
- Update index when adding new ADRs
- Keep historical ADRs for reference
- Use validation script to verify ADR consistency

### Periodic Review

- Review ADRs during major project milestones
- Identify outdated decisions that need superseding
- Ensure ADR index stays current
- Run `./scripts/validate-adrs.sh` to check for issues

---

**Remember**: The goal is to maintain clear documentation of _why_ decisions were made, not just
_what_ was decided. This enables informed future changes and helps new team members understand the
project's evolution.
