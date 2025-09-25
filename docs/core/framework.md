# Agentic Coding Framework

## Core Methodology

**🚨 CRITICAL FRAMEWORK**: This project demonstrates instruction-only development where
humans provide strategic direction and AI handles complete implementation.

## Role Definition and Boundaries

### Human Role: Strategic Architect & Product Owner

- Provides high-level requirements and feature specifications
- Sets architectural direction and technical constraints
- Makes product decisions and priority determinations
- Gives feedback on implementation and user experience
- **Does NOT write code** - maintains pure instruction-based approach

### AI Role: Complete Implementation Team

- Handles all code implementation following TDD methodology
- Manages testing strategies and maintains comprehensive test coverage
- Configures and maintains CI/CD pipeline and deployment processes
- Creates and maintains all project documentation and ADRs
- Ensures code quality, linting, type safety, and professional standards
- **100% responsible for technical execution** via instruction interpretation

## Instruction-Based Development Principles

1. **Pure Instruction Implementation**: All development occurs through natural language instruction rather than manual coding
2. **Strategic vs. Tactical Separation**: Human focuses on "what" and "why", AI handles "how" and "when"
3. **Professional Standards Maintenance**: Enterprise-quality practices maintained entirely through AI implementation
4. **Complete Lifecycle Coverage**: From planning to production deployment via instruction-only workflow
5. **Measurable AI Contribution**: Track and document 100% AI-generated codebase metrics

## Quality Assurance Through AI

- **Test-Driven Development**: AI writes comprehensive tests before implementation
- **Atomic Commit Strategy**: AI maintains clean, logical commit history
- **Documentation Generation**: AI creates and maintains all technical documentation
- **CI/CD Management**: AI configures and maintains automated quality assurance
- **Code Review Standards**: AI applies enterprise coding standards throughout development

## Agent-Centric Implementation

### Specialized Agent Roles

- **Frontend Specialist**: React, TypeScript, and UI implementation
- **Testing Specialist**: TDD methodology and comprehensive test coverage
- **Quality Assurance**: Code review, standards enforcement, accessibility
- **Documentation Agent**: Technical writing, ADRs, and project documentation

### Agent Coordination Benefits

- **Parallel Development**: Multiple specialized agents work simultaneously
- **Domain Expertise**: Each agent focuses on their area of specialization
- **Quality Enhancement**: Multi-agent review improves output quality
- **Reduced Cognitive Load**: Focused context per agent improves efficiency

## Development Methodology Integration

### Task Planning Protocol

All non-trivial changes must follow structured task planning:

- Use TodoWrite for comprehensive task breakdown
- Present plan to user before implementation
- Track progress incrementally with status updates
- Complete tasks atomically with proper verification

### Architecture Decision Records (ADRs)

- **When**: Before any significant technical decision
- **Where**: `docs/adr/###-title.md` using sequential numbering
- **Content**: Problem statement, alternatives considered, decision rationale
- **Process**: See `docs/adr/PROCESS.md` for complete guidelines

### Issue Prompt Logs (IPLs)

Document instruction-only development methodology:

- **When**: For issues demonstrating effective AI collaboration patterns
- **Where**: `docs/ipl/###-issue-title.md` matching GitHub issue numbers
- **Content**: Prompt evolution, requirement refinements, lessons learned
- **Process**: See `docs/ipl/README.md` for complete guidelines

## Quality Standards

### Code Quality

- **TypeScript**: Strict mode, no `any` types
- **ESLint**: Zero errors/warnings (enforced via pre-commit hooks)
- **Prettier**: Consistent formatting (enforced via pre-commit hooks)
- **Testing**: TDD approach with comprehensive coverage

### Development Process

- **Atomic Commits**: One logical change per commit with issue linking
- **Feature Branches**: All work via PRs, never direct commits to main
- **Quality Gates**: Lint, typecheck, test before completion
- **Documentation**: Maintain consistency across all project documentation

## Measurable AI Contribution

Track and document:

- 100% AI-generated codebase metrics
- Instruction-to-implementation success rates
- Quality maintenance through AI-only development
- Learning patterns and effective collaboration techniques

This framework enables complete software development through natural language instruction
while maintaining professional standards and quality assurance.
