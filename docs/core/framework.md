# Agentic Coding Framework

> **Related Documentation**: [Development Principles](principles.md) | [Git Workflows](workflows.md) |
> [Operational Guide](../development/workflow.md)

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

- Handles all code implementation with comprehensive testing strategies
- Manages test coverage and maintains CI/CD pipeline and deployment processes
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

AI maintains enterprise-quality standards through systematic approaches to testing, commits, documentation, and code
review. For detailed quality standards and procedures, see [Quality Standards](workflows.md#quality-gates).

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

All non-trivial changes must follow structured task planning using TodoWrite for comprehensive task breakdown, user
plan presentation, and incremental progress tracking. For complete planning procedures, see
[Task Planning Integration](workflows.md#task-planning-integration).

### Documentation Standards

- **Architecture Decision Records (ADRs)**: Document significant technical decisions in `docs/adr/`
- **Mermaid Diagrams**: Create visual representations for architecture, logic flows, and system interactions

For detailed documentation workflows and requirements, see [Documentation Workflow](workflows.md#documentation-workflow).

## Implementation Standards

Core quality principles maintained through AI development:

- **Test-First Development**: Comprehensive testing strategies with detailed workflow in [TDD Commit Pattern](workflows.md#tdd-commit-pattern)
- **Strict TypeScript**: No `any` types, comprehensive type safety
- **Zero-Warning Policy**: ESLint and Prettier enforcement
- **Code Complexity Standards**: ADR-027 compliance (cognitive complexity ≤15, nesting depth ≤4, cyclomatic complexity ≤15)
- **Atomic Development**: Incremental commits with clear progression

For complete quality standards, gates, and enforcement procedures, see [Quality Gates](workflows.md#quality-gates).

## Code Complexity Quality Gates

All code must meet complexity thresholds before merge (ADR-027):

- **Cognitive Complexity**: ≤15 per function
- **Nesting Depth**: ≤4 levels
- **Cyclomatic Complexity**: ≤15 per function
- **Function Length**: ≤150 lines (warning), ≤300 lines (error)
- **Parameters**: ≤4 per function (warning)

**Enforcement Mechanisms**:

- Pre-commit: ESLint blocks commits with complexity errors
- CI/CD: SonarCloud analysis on every PR
- Code Review: Manual verification of complexity patterns

**Refactoring Guidelines**: See [Code Complexity Guidelines](../guidelines/code-complexity-guidelines.md) for practical patterns.

## Measurable AI Contribution

Track and document:

- 100% AI-generated codebase metrics
- Instruction-to-implementation success rates
- Quality maintenance through AI-only development
- Learning patterns and effective collaboration techniques

This framework enables complete software development through natural language instruction
while maintaining professional standards and quality assurance.
