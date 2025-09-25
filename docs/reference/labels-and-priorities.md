# GitHub Issue Labels and Priority System

## Priority System

**🏷️ REQUIREMENT**: All GitHub issues must be assigned appropriate priority labels.

### Priority Labels

#### priority-1-critical 🔴

- **Blocking issues** preventing development or deployment
- **Security vulnerabilities** requiring immediate attention
- **Production bugs** affecting user experience
- **Immediate attention required** within 24 hours

#### priority-2-high 🟠

- **Important features** for current sprint
- **Significant bugs** affecting core functionality
- **User experience improvements** with high impact
- **Current sprint priority** - should be worked on next

#### priority-3-medium 🟡

- **Standard features** for future sprints
- **Enhancements** that improve but don't block functionality
- **Technical debt** that should be addressed
- **Next sprint scheduling** - planned future work

#### priority-4-low 🟢

- **Nice-to-have features** for backlog
- **Minor improvements** with limited impact
- **Experimental features** for exploration
- **Backlog items** - work when time permits

## Complexity Estimation

**🎯 REQUIREMENT**: All GitHub issues must be assigned complexity labels for effort estimation.

### Complexity Labels

#### complexity-minimal 🟢

- **Single file changes** or quick fixes
- **Simple configuration updates**
- **Documentation additions** without research
- **Estimated effort**: 15-30 minutes

#### complexity-simple 🔵

- **Basic features** with straightforward implementation
- **Single component additions**
- **Clear requirements** with known approach
- **Estimated effort**: 1-3 hours

#### complexity-moderate 🟡

- **Multi-component changes** affecting 3-5 files
- **State management updates**
- **Integration between systems**
- **Some architectural decisions required**
- **Estimated effort**: 3-8 hours

#### complexity-complex 🟠

- **Architecture changes** affecting system design
- **Multiple integration points**
- **Research required** for implementation approach
- **Breaking changes** or major refactoring
- **Estimated effort**: 1-3 days

#### complexity-epic 🔴

- **Major overhauls** requiring significant planning
- **Multiple related features** delivered together
- **System-wide changes** affecting many components
- **Long-term projects** spanning multiple sprints
- **Estimated effort**: 1+ weeks

## Category Labels

**Every issue must have exactly ONE category label:**

### category-feature 🟦

- **Core application functionality** and user features
- **Todo CRUD operations** and user interactions
- **UI/UX improvements** for end users
- **Feature bugs and fixes**

### category-infrastructure 🟧

- **DevOps, CI/CD, deployment** configurations
- **GitHub Actions and workflows**
- **Testing infrastructure** and automation
- **Security and performance tooling**
- **Backend architecture** and system design

### category-documentation 🟩

- **Documentation files** and technical writing
- **Architecture Decision Records (ADRs)**
- **Process documentation** and guidelines
- **Diagrams and visual documentation**

### category-dx 🟪

- **Developer experience** improvements
- **Claude Code workflows** and AI collaboration
- **Development tooling** and automation
- **Issue/PR management** processes
- **Code quality** and development standards

## Special Labels

### claude-workflow

- **Claude Code usage** and instructions
- **AI collaboration patterns** and workflows
- **CLAUDE.md documentation** and requirements
- **Task planning protocols** and methodologies
- **Agent coordination** and specialized implementations

### enhancement

- **Feature improvements** and enhancements
- **Performance optimizations**
- **User experience improvements**

### documentation

- **Documentation-related work**
- **Can be combined with category labels**

### ux

- **User experience focused** improvements
- **Interface and interaction enhancements**

## Label Usage Guidelines

### Issue Creation Checklist

**🚨 MANDATORY**: All issues must include:

- [ ] **Priority label** (priority-1-critical through priority-4-low)
- [ ] **Complexity label** (complexity-minimal through complexity-epic)
- [ ] **Category label** (exactly one category)
- [ ] **Assessment rationale** in issue description

### Claude Code Commands

Always include labels in issue creation:

```bash
gh issue create --title "Issue Title" \
  --label "priority-2-high,complexity-moderate,category-feature" \
  --body "Issue description with rationale"
```

### Strategic Planning

#### Quick Wins (High Impact + Low Effort)

- **priority-2-high** + **complexity-simple**
- **priority-2-high** + **complexity-minimal**

#### Major Features (High Impact + High Effort)

- **priority-2-high** + **complexity-moderate**
- **priority-2-high** + **complexity-complex**

#### Maintenance Work (Medium Impact + Low Effort)

- **priority-3-medium** + **complexity-simple**
- **priority-3-medium** + **complexity-minimal**

#### Learning Opportunities (Low Priority + Complex Work)

- **priority-4-low** + **complexity-complex**
- **priority-4-low** + **complexity-epic**

## Assessment Examples

### Feature Implementation Example

**Issue**: "Add todo filtering by completion status"

- **Priority**: priority-2-high (important user feature)
- **Complexity**: complexity-moderate (state management + UI changes)
- **Category**: category-feature (core todo functionality)

### Infrastructure Example

**Issue**: "Set up automated dependency updates"

- **Priority**: priority-3-medium (useful but not urgent)
- **Complexity**: complexity-simple (configuration setup)
- **Category**: category-infrastructure (DevOps automation)

### Documentation Example

**Issue**: "Create development workflow diagram"

- **Priority**: priority-4-low (nice to have)
- **Complexity**: complexity-minimal (diagram creation)
- **Category**: category-documentation (process documentation)

This labeling system enables effective issue prioritization, effort estimation, and strategic development planning.
