# Project Context and Architecture

## Project Overview

This is an agentic coding prototype demonstrating instruction-only development where
humans provide strategic direction and AI handles complete implementation of a todo application.

## Current Technology Stack

### Frontend Framework

- **Next.js 14** with App Router
- **React 18** with functional components and hooks
- **TypeScript** with strict mode configuration

### Styling and Design

- **Tailwind CSS** for utility-first styling
- **Responsive design** with mobile-first approach
- **Accessibility compliance** with ARIA attributes

### State Management

- **Custom React hooks** (useTodos, useLocalStorage)
- **localStorage** for client-side persistence
- **No external state management library** (Redux, Zustand, etc.)

### Testing Framework

- **Jest** as test runner
- **React Testing Library** for component testing
- **TDD methodology** - tests written before implementation
- **Coverage reporting** with Jest built-in tools

### Development Tools

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript compiler** for type checking
- **Pre-commit hooks** for automated quality enforcement

### Deployment and Infrastructure

- **Vercel** for production deployment
- **GitHub Actions** for CI/CD pipeline
- **Docker** for local development environment
- **GitHub** for repository and issue management

## Current Architecture Decisions

See `docs/adr/` directory for complete Architecture Decision Records:

1. **ADR-001**: Next.js 14 + App Router framework choice
2. **ADR-002**: TypeScript for type safety
3. **ADR-003**: Tailwind CSS for styling
4. **ADR-004**: Test-driven development methodology
5. **ADR-005**: localStorage for data persistence
6. **ADR-006**: React Testing Library + Jest for testing
7. **ADR-007**: Custom React hooks for state management
8. **ADR-008**: GitHub Issues for project management
9. **ADR-009**: Comprehensive testing strategy
10. **ADR-010**: Atomic commit strategy

## Project Structure

```text
my-first-claude-code_2/
├── app/                     # Next.js app directory
│   ├── components/          # React components
│   │   ├── AddTodo.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoList.tsx
│   │   └── __tests__/       # Component tests
│   ├── hooks/               # Custom React hooks
│   │   ├── useTodos.ts
│   │   ├── useLocalStorage.ts
│   │   └── __tests__/       # Hook tests
│   ├── types/               # TypeScript type definitions
│   │   └── todo.ts
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Home page component
├── docs/                    # Project documentation
│   ├── agents/              # Agent-specific guidelines
│   ├── core/                # Framework and workflow docs
│   ├── reference/           # Lookup information
│   ├── adr/                 # Architecture Decision Records
│   └── ipl/                 # Issue Prompt Logs
├── public/                  # Static assets
├── .github/                 # GitHub workflows and templates
│   └── workflows/
│       └── ci.yml           # CI/CD pipeline
├── CLAUDE.md               # Claude Code instructions
├── README.md               # Project documentation
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── jest.config.js          # Jest test configuration
├── next.config.js          # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Data Models

### Todo Interface

```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### State Management

```typescript
interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, text: string) => void;
}
```

## Current Features

### Implemented Functionality

- ✅ Add new todos with text input
- ✅ Toggle todo completion status
- ✅ Delete individual todos
- ✅ Edit todo text inline
- ✅ Persistent storage with localStorage
- ✅ Responsive mobile design
- ✅ Keyboard navigation support
- ✅ Comprehensive test coverage
- ✅ TypeScript strict mode compliance
- ✅ Automated quality gates (lint, format, test)

### Feature Backlog

See GitHub Issues for complete feature roadmap:

- Filter todos by completion status
- Todo completion timestamps
- Contextual timestamp display
- Automatic reordering of completed todos
- Backend persistence and multi-device sync
- Touch gesture support for mobile
- Enhanced accessibility features

## Development Methodology

This project demonstrates instruction-only development with AI handling complete implementation. For detailed
methodology and agent coordination patterns, see [Agentic Coding Framework](framework.md).

## Quality Standards

Current project maintains:

- **TypeScript Coverage**: 100% (strict mode, no `any` types)
- **Test Coverage**: 80%+ line coverage, 100% for critical paths
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimal React patterns and bundle size management

For complete quality standards, development processes, and enforcement procedures, see
[Quality Gates](workflows.md#quality-gates).

This project context provides the foundation for specialized agent coordination and instruction-only development methodology.
