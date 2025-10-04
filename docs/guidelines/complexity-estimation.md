# Complexity-Based Effort Estimation Guidelines

**🎯 REQUIREMENT**: All GitHub issues must be assigned complexity labels to enable accurate effort estimation in
Claude Code development.

## Complexity Label Usage

### complexity-minimal 🟢

#### Single file changes, documentation updates, typos

- **Characteristics**: Isolated changes, no logic complexity, minimal testing
- **Examples**: README updates, comment additions, simple configuration changes
- **Effort**: Quick fixes, usually completed in single session
- **Testing**: Minimal or no additional tests required
- **Review**: Self-review sufficient

### complexity-simple 🔵

#### Basic feature implementation, straightforward logic

- **Characteristics**: Single responsibility, existing patterns, clear requirements
- **Examples**: Simple component creation, basic CRUD operations, standard patterns
- **Effort**: Straightforward implementation following established patterns
- **Testing**: Standard unit tests following existing patterns
- **Review**: Peer review for code quality

### complexity-moderate 🟡

#### Multi-component changes, state management, integration

- **Characteristics**: Multiple files, component interaction, moderate testing scope
- **Examples**: Feature with multiple components, state management, API integration
- **Effort**: Requires planning and coordination across multiple components
- **Testing**: Integration tests, multiple test scenarios
- **Review**: Technical review, architectural considerations

### complexity-complex 🟠

#### Architecture changes, multiple integrations, system design

- **Characteristics**: System-wide impact, architectural decisions, comprehensive testing
- **Examples**: CI/CD pipeline setup, major UX overhauls, cross-cutting concerns
- **Effort**: Significant planning, potential for multiple iterations and refinement
- **Testing**: Comprehensive test coverage, multiple test types
- **Review**: Multi-person review, architectural validation

### complexity-epic 🔴

#### Major system overhauls, breaking changes, foundational work

- **Characteristics**: Project-wide impact, breaking changes, extensive documentation
- **Examples**: Framework migrations, complete redesigns, major refactoring
- **Effort**: Major undertaking requiring careful planning and phased approach
- **Testing**: Full regression testing, migration testing
- **Review**: Team review, stakeholder approval

## Complexity Assessment Criteria

### Cognitive Load Factors

- **Logic Complexity**: How complex is the business logic?
- **State Management**: How many state changes are involved?
- **Component Interaction**: How many components need to work together?
- **Data Flow**: How complex is the data transformation/flow?

### Technical Impact Factors

- **File Count**: How many files need to be modified?
- **Cross-cutting Concerns**: Does this affect multiple system layers?
- **Dependencies**: How many external dependencies are involved?
- **Breaking Changes**: Will this break existing functionality?

### Context Switching Factors

- **Domain Knowledge**: How much domain expertise is required?
- **Technology Stack**: Is this using familiar or new technologies?
- **Documentation**: How much research/documentation is needed?
- **Integration Points**: How many external systems are involved?

## Complexity-Based Development Workflow

### 1. Issue Assessment

#### Evaluate cognitive load and architectural impact

- Review requirements and acceptance criteria
- Identify affected components and systems
- Assess testing requirements
- Consider documentation needs

### 2. Planning Depth

#### Match planning effort to complexity level

- **Minimal/Simple**: Quick review, start implementation
- **Moderate**: Create implementation plan, identify risks
- **Complex/Epic**: Detailed planning, break into phases

### 3. Session Selection

#### Choose appropriate complexity for available focus time

- **Short Sessions**: Minimal/Simple complexity
- **Medium Sessions**: Moderate complexity
- **Long Sessions**: Complex complexity
- **Multi-day**: Epic complexity

### 4. Context Preparation

#### Gather necessary information before starting complex work

- Review related code and documentation
- Understand dependencies and constraints
- Prepare development environment
- Set up testing scenarios

### 5. Review Planning

#### Scale review depth to complexity level

- **Minimal**: Self-review checklist
- **Simple**: Peer code review
- **Moderate**: Technical review with testing
- **Complex**: Multi-person review with architectural validation
- **Epic**: Team review with stakeholder approval

### 6. Documentation Needs

#### Increase documentation effort with complexity

- **Minimal**: Code comments if needed
- **Simple**: Basic documentation updates
- **Moderate**: Feature documentation, testing notes
- **Complex**: Architecture documentation, ADR updates
- **Epic**: Comprehensive documentation, migration guides

## Complexity Assignment Guidelines

### Assessment Process

1. **Initial Evaluation**: Quick complexity assessment during issue creation
2. **Detailed Analysis**: Thorough evaluation before implementation
3. **Reassessment**: Adjust complexity if scope changes during development
4. **Retrospective**: Review accuracy for future estimation improvement

### Common Patterns

- **New Features**: Usually Simple to Moderate
- **Bug Fixes**: Usually Minimal to Simple
- **Refactoring**: Usually Moderate to Complex
- **Infrastructure**: Usually Complex to Epic
- **Documentation**: Usually Minimal

### Red Flags for Higher Complexity

- Multiple teams need coordination
- Requires breaking changes
- Involves new technology or patterns
- Affects core system architecture
- Requires extensive testing or validation

## Combined Priority and Complexity Usage

### Planning Matrix

| Priority / Complexity | Minimal       | Simple               | Moderate              | Complex             | Epic             |
| --------------------- | ------------- | -------------------- | --------------------- | ------------------- | ---------------- |
| **Critical**          | Immediate fix | Quick win            | Urgent feature        | Major initiative    | Crisis response  |
| **High**              | Easy win      | Core feature         | Important enhancement | Strategic project   | Major release    |
| **Medium**            | Maintenance   | Standard feature     | Feature enhancement   | Improvement project | Future planning  |
| **Low**               | Quick tasks   | Learning opportunity | Nice-to-have          | Research project    | Long-term vision |

### Development Strategy

- **High Priority + Low Complexity**: Quick wins, immediate value
- **High Priority + High Complexity**: Major initiatives, careful planning
- **Low Priority + Low Complexity**: Filler work, learning opportunities
- **Low Priority + High Complexity**: Research, future preparation

## Integration with Other Labels

### Claude-Workflow Integration

For AI collaboration and Claude Code workflow issues, complexity assessment includes:

**AI-Specific Complexity Factors:**

- **Instruction clarity requirements**: How clear the AI instructions need to be
- **Methodology documentation**: Level of agentic coding process documentation needed
- **Cross-reference maintenance**: Documentation consistency requirements
- **AI collaboration pattern complexity**: How novel the AI interaction pattern is

**Combined Label Examples:**

- **claude-workflow + complexity-minimal**: Simple CLAUDE.md updates, basic instruction clarifications
- **claude-workflow + complexity-simple**: Standard AI workflow documentation, basic process improvements
- **claude-workflow + complexity-moderate**: Comprehensive AI methodology documentation, multi-file process updates
- **claude-workflow + complexity-complex**: Major agentic coding workflow overhauls, AI agent implementations
- **claude-workflow + complexity-epic**: Complete AI collaboration methodology redesigns, fundamental process changes

**📋 Full Guidelines**: See [`claude-workflow-labels.md`](claude-workflow-labels.md) for comprehensive AI collaboration
issue management.

### Related Documentation

- **Priority System**: [`priority-system.md`](priority-system.md)
- **Claude-Workflow Labels**: [`claude-workflow-labels.md`](claude-workflow-labels.md)
- **Project Management**: [`../development/project-management.md`](../development/project-management.md)

---

**Note**: Complexity estimation is a skill that improves with practice. Regular retrospectives on estimation
accuracy help refine the process for better project planning.
