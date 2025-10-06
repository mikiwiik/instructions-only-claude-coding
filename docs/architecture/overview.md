# Architecture Overview

This document provides a comprehensive overview of the Todo App's technical architecture, design decisions, and system structure.

## Project Overview

The Todo App is a Next.js-based web application built as a learning platform for Claude Code development workflows
and modern web development practices. It demonstrates AI-assisted coding, Test-Driven Development (TDD), and
collaborative development patterns.

## Technology Stack

### Core Technologies

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS for utility-first styling approach
- **Testing**: Jest + React Testing Library for comprehensive testing
- **Development**: Test-Driven Development (TDD) methodology

### Development Tools

- **Code Quality**: ESLint, Prettier, markdownlint
- **Pre-commit Hooks**: Husky + lint-staged for automated quality checks
- **Type Checking**: TypeScript with strict configuration
- **Package Management**: npm with package-lock.json tracking

### Infrastructure

- **Version Control**: Git with GitHub for repository hosting
- **CI/CD**: GitHub Actions for automated testing and building
- **Deployment**: Vercel with automatic deployment pipeline
- **Node.js**: Version 22.x for runtime environment

## Project Structure

```text
instructions-only-claude-coding/
├── app/                    # Next.js app directory (App Router)
│   ├── api/               # API routes (Edge Runtime)
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── types/             # TypeScript type definitions
│   └── __tests__/         # Component and hook tests
├── docs/                  # Project documentation
│   ├── adr/              # Architecture Decision Records
│   ├── architecture/     # Architecture documentation
│   ├── development/      # Development workflow docs
│   ├── guidelines/       # Process and standards docs
│   └── setup/           # Installation and deployment guides
├── .github/              # GitHub configuration
│   ├── ISSUE_TEMPLATE/   # Issue templates for consistent reporting
│   └── workflows/        # GitHub Actions CI/CD workflows
├── public/               # Static assets and files
├── CLAUDE.md            # Claude Code development guidelines
├── README.md            # Project overview and quick start
└── package.json         # Dependencies and project configuration
```

## System Architecture

### Application Architecture

The Todo App follows a component-based architecture with clear separation of concerns:

#### Frontend Layer

- **React Components**: Modular UI components with TypeScript interfaces
- **Custom Hooks**: Reusable logic for state management and side effects
- **Type Definitions**: Comprehensive TypeScript types for type safety

#### State Management

- **Custom Hooks**: `useTodos` hook for todo state management
- **Local Storage**: Client-side persistence for todo data
- **React State**: Component-level state for UI interactions

#### Testing Layer

- **Unit Tests**: Component and hook testing with React Testing Library
- **Integration Tests**: User workflow testing for complete features
- **Test Coverage**: Comprehensive coverage of business logic

#### Real-Time Synchronization

- **SSE Connection**: Server-Sent Events for real-time updates across clients
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors
- **Sync Queue**: Retry logic with exponential backoff for reliability
- **Conflict Resolution**: Last-write-wins strategy using server timestamps

For detailed architecture, see [Real-Time Sync Architecture Diagram](realtime-sync-diagram.md).

### Data Architecture

#### Data Model

```typescript
// Core Todo interface
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

// Todo operations interface
interface TodoOperations {
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompleted: () => void;
}
```

#### Data Persistence

- **Storage**: Browser localStorage for client-side persistence
- **Serialization**: JSON serialization with date handling
- **Synchronization**: Real-time updates across browser tabs and devices via Server-Sent Events (SSE)

### Development Architecture

#### Test-Driven Development Flow

1. **Write Tests**: Create failing tests for new functionality
2. **Implement**: Write minimum code to make tests pass
3. **Refactor**: Improve code while maintaining passing tests
4. **Iterate**: Continue cycle for each feature

#### Code Quality Pipeline

1. **Pre-commit**: Automated linting, formatting, and type checking
2. **CI Pipeline**: Automated testing, building, and validation
3. **Code Review**: Manual review process for pull requests
4. **Deployment**: Automated deployment after successful CI

## Architectural Decision Records

The project documents all major architectural decisions using ADRs (Architecture Decision Records). For a
complete and up-to-date list of all ADRs, see [Architecture Decision Records](../adr/README.md).

## Design Patterns and Principles

### Component Design Patterns

#### Custom Hooks Pattern

- **Purpose**: Encapsulate business logic and state management
- **Benefits**: Reusability, testability, separation of concerns
- **Example**: `useTodos` hook for todo operations

#### Composition Pattern

- **Purpose**: Build complex UIs from simple, reusable components
- **Benefits**: Modularity, maintainability, flexibility
- **Example**: TodoList composed of TodoItem components

### Development Patterns

#### Test-Driven Development (TDD)

- **Red**: Write failing test for new functionality
- **Green**: Implement minimum code to pass test
- **Refactor**: Improve code while maintaining passing tests

#### Atomic Commits

- **One Change**: Each commit represents single logical change
- **Descriptive**: Clear commit messages with issue references
- **Revertible**: Each commit can be safely reverted

## Quality Assurance Architecture

### Automated Quality Checks

#### Pre-commit Hooks

- **ESLint**: Code quality and style enforcement
- **Prettier**: Automatic code formatting
- **TypeScript**: Type checking and compilation
- **markdownlint**: Documentation formatting

#### CI/CD Pipeline

- **Testing**: Automated test suite execution
- **Building**: Production build verification
- **Linting**: Code quality validation
- **Type Checking**: TypeScript compilation verification

### Manual Quality Processes

#### Code Review

- **Pull Requests**: Required for all changes to main branch
- **Review Criteria**: Code quality, test coverage, documentation
- **Approval Process**: At least one review required

#### Testing Strategy

- **Unit Tests**: Component and hook testing
- **Integration Tests**: End-to-end user workflows
- **Manual Testing**: User acceptance testing

## Deployment Architecture

### CI/CD Pipeline

#### GitHub Actions Workflow

1. **Trigger**: Push to main branch or pull request creation
2. **Environment**: Node.js 22.x matrix across multiple operating systems
3. **Steps**: Install dependencies → Type check → Lint → Test → Build
4. **Deployment**: Automatic Vercel deployment on successful CI

#### Vercel Deployment

- **Framework Detection**: Automatic Next.js configuration
- **Build Process**: Optimized production builds
- **CDN**: Global content delivery network
- **Preview Deployments**: Automatic preview URLs for pull requests

### Production Environment

#### Performance Optimizations

- **Next.js Optimizations**: Automatic code splitting and optimization
- **Static Generation**: Pre-built pages for optimal performance
- **CDN Distribution**: Global content delivery
- **Caching**: Automatic asset caching and optimization

#### Monitoring and Observability

- **Vercel Analytics**: Basic traffic and performance metrics
- **GitHub Integration**: Deployment status in commit history
- **Error Tracking**: Built-in error monitoring

## Scalability Considerations

### Current Architecture Limitations

- **Client-side Storage**: Limited to browser localStorage for local todos
- **Polling-Based Sync**: Development uses polling instead of Redis Pub/Sub for shared todos
- **In-Memory KV Store**: Production should use persistent storage (Redis, Vercel KV)

### Future Scalability Options

- **Redis Pub/Sub**: Replace polling with real-time Pub/Sub for SSE broadcasts
- **Persistent KV Store**: Transition from in-memory to Redis or Vercel KV
- **User Authentication**: Add auth layer for secure shared list access
- **Operational Transforms**: Advanced conflict resolution beyond last-write-wins
- **Presence Indicators**: Show active users in shared lists
- **Database Migration**: Full database backend for complex queries and analytics

## Security Considerations

### Current Security Measures

- **HTTPS**: Automatic SSL/TLS encryption via Vercel
- **Dependency Security**: Regular dependency updates and audits
- **Code Quality**: Automated linting and security checks
- **No Sensitive Data**: Client-side only, no server-side secrets

### Security Best Practices

- **Dependency Management**: Regular security audits and updates
- **Code Review**: Security considerations in review process
- **Static Analysis**: Automated security scanning in CI
- **Documentation**: Security considerations documented in ADRs

## Development Workflow Integration

### Claude Code Integration

- **AI-Assisted Development**: Claude Code for implementation guidance
- **Documentation Generation**: AI assistance for comprehensive documentation
- **Code Review**: AI support for code quality and best practices
- **Learning Platform**: Demonstrates AI-assisted development workflows

### GitHub Integration

- **Issue Tracking**: Comprehensive issue management with labels
- **Pull Requests**: Branch-based development with review process
- **Automation**: GitHub Actions for CI/CD and quality assurance
- **Documentation**: Issue templates and workflow documentation

## Maintenance and Evolution

### Documentation Maintenance

- **Consistency Requirements**: Multi-document update workflows
- **Cross-references**: Maintained links between documentation
- **Version Control**: Documentation changes tracked with code
- **Review Process**: Documentation included in code review

### Architecture Evolution

- **ADR Process**: Document all significant architectural changes
- **Backward Compatibility**: Careful consideration of breaking changes
- **Migration Strategies**: Planned approach for major updates
- **Learning Integration**: Architecture changes support educational goals

---

This architecture overview provides the foundation for understanding the Todo App's technical design and serves as a
reference for future development and architectural decisions.
