# Agent Coordination Patterns

## Multi-Agent Workflow Strategies

This document defines coordination patterns for parallel agent execution in Claude Code development using custom
project-specific agents configured in `.claude/agents/`.

## Custom Agent Configuration

**Project-Specific Agents** (located in `.claude/agents/`):

- **frontend-specialist.yaml**: React components, TypeScript interfaces, Tailwind styling
- **testing-specialist.yaml**: TDD methodology, React Testing Library, Jest coverage
- **quality-assurance.yaml**: Code review, linting, security, performance analysis
- **documentation-agent.yaml**: README updates, ADRs, technical writing

Each agent has:

- **Specialized System Prompts**: Domain expertise for todo application development
- **Restricted Tool Access**: Security-appropriate tools for each role
- **Coordination Protocols**: Defined interaction patterns with other agents
- **Project Context**: Understanding of Next.js 14, TypeScript strict mode, Tailwind CSS

## Standard 3-Agent Coordination Patterns

### Pattern 1: Feature Development (Implementation + Testing + Documentation)

**Agents:**

- **Frontend Specialist**: Core feature implementation
- **Testing Specialist**: TDD approach and comprehensive testing
- **Documentation Agent**: README updates and ADR creation if needed

**Coordination Flow:**

1. **Parallel Initialization**: All agents analyze requirement simultaneously
2. **Testing Specialist**: Writes failing tests first (TDD red phase) → **Atomic Commit**
3. **Frontend Specialist**: Implements minimal functionality to pass tests → **Atomic Commit**
4. **Frontend Specialist**: Refactors and enhances implementation → **Atomic Commits**
5. **Testing Specialist**: Adds comprehensive test coverage → **Atomic Commits**
6. **Documentation Agent**: Updates documentation and README → **Atomic Commit**
7. **Quality Review**: All agents collaborate on final refinements → **Atomic Commits**
8. **Test Verification**: All tests passing and committed to version control
9. **Integration**: Final commit with "Closes #X" summarizing complete feature

### Pattern 2: Infrastructure + Feature (Parallel Development)

**Agents:**

- **Frontend Specialist**: Feature implementation
- **Quality Assurance**: Infrastructure setup and validation
- **Testing Specialist**: Testing infrastructure and coverage

**Coordination Flow:**

1. **Parallel Streams**: Infrastructure and feature work simultaneously
2. **Quality Gates**: QA agent ensures standards throughout
3. **Testing Integration**: Testing specialist validates both streams
4. **Convergence**: Combined delivery of feature + infrastructure

### Pattern 3: Quality-Focused Development

**Agents:**

- **Frontend Specialist**: Implementation with quality focus
- **Quality Assurance**: Continuous review and standards enforcement
- **Testing Specialist**: Comprehensive test coverage validation

**Coordination Flow:**

1. **Quality-First Planning**: QA agent defines acceptance criteria
2. **TDD Implementation**: Testing specialist leads with test requirements
3. **Guided Development**: Frontend specialist implements to standards
4. **Continuous Review**: Ongoing quality validation throughout process

## Agent Selection Guidelines

### When to Use Specific Agents

**Frontend Specialist:**

- React component development
- UI/UX implementation
- TypeScript interface design
- Tailwind CSS styling

**Testing Specialist:**

- TDD methodology implementation
- Test coverage requirements
- User workflow validation
- Quality gate enforcement

**Quality Assurance:**

- Code review and standards enforcement
- Accessibility compliance validation
- Security analysis
- Performance optimization

**Documentation Agent:**

- ADR creation for architectural decisions
- README updates for new features
- Process documentation
- Learning material creation

### Complexity-Based Agent Selection

**Simple Tasks** (single agent):

- Minor bug fixes: Frontend Specialist
- Documentation updates: Documentation Agent
- Test additions: Testing Specialist

**Moderate Tasks** (2-3 agents):

- Feature implementation: Frontend + Testing
- Quality improvements: Frontend + QA
- Documentation overhauls: Documentation + QA

**Complex Tasks** (3+ agents):

- Major features: Frontend + Testing + Documentation
- Architecture changes: All agents + QA review
- Infrastructure updates: QA + Testing + Documentation

## Coordination Protocols

### Communication Patterns

**Handoff Points:**

- Frontend completes component → Testing validates functionality
- Testing identifies issues → Frontend addresses concerns
- Implementation complete → QA reviews for standards compliance
- All work complete → Documentation agent updates project materials

**Conflict Resolution:**

- **Technical Disagreements**: QA agent makes final technical decisions
- **Implementation Approach**: Frontend specialist leads architectural choices
- **Testing Strategy**: Testing specialist determines testing approach
- **Documentation Standards**: Documentation agent sets writing guidelines

### Synchronization Points

**Required Checkpoints:**

1. **Initial Analysis**: All agents understand requirements
2. **Implementation Plan**: Approach agreed upon by relevant agents
3. **Quality Gates**: Standards validation at key milestones
4. **Test Verification**: All tests passing and in version control
5. **Final Integration**: All work streams merged successfully

**Optional Checkpoints:**

- Mid-implementation reviews for complex features
- Cross-agent consultation for specialized decisions
- Performance validation for optimization work

## Advanced Coordination Patterns

### Research + Implementation Pattern

**Agents:**

- **Documentation Agent**: Research and analysis
- **Frontend Specialist**: Implementation based on research
- **Quality Assurance**: Standards validation throughout

**Use Cases:**

- New technology integration
- Architecture pattern adoption
- Complex feature planning

### Review + Enhancement Pattern

**Agents:**

- **Quality Assurance**: Comprehensive code review
- **Testing Specialist**: Test coverage analysis
- **Documentation Agent**: Documentation updates

**Use Cases:**

- Code quality improvements
- Technical debt reduction
- Process optimization

### Emergency Response Pattern

**Agents:**

- **Quality Assurance**: Issue analysis and triage
- **Frontend Specialist**: Rapid implementation
- **Testing Specialist**: Validation and regression prevention

**Use Cases:**

- Critical bug fixes
- Security vulnerability patches
- Production incident response

## Best Practices

### Agent Coordination

- Clear role boundaries prevent overlap and conflict
- Regular synchronization points ensure alignment
- Quality gates maintain standards throughout development
- **Atomic commits** capture each agent's contributions clearly
- Documentation captures decisions for future reference

### Parallel Efficiency

- Independent work streams maximize development velocity
- Specialized expertise improves output quality
- Coordinated delivery ensures integrated results
- Reduced context switching maintains focus

### Quality Assurance

- Multi-agent review improves code quality
- Specialized validation ensures comprehensive coverage
- Standards enforcement maintains consistency
- Continuous feedback enables rapid iteration
