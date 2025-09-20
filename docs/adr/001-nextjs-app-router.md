# ADR-001: Use Next.js 14 with App Router

## Status

Accepted

## Context

We need to choose a React framework for building our Todo application. The project requires:
- Server-side rendering capabilities
- Good developer experience
- Modern React patterns
- Built-in routing
- Production-ready tooling
- TypeScript support

## Decision

Use Next.js 14 with the App Router architecture instead of the older Pages Router or other React frameworks.

## Consequences

### Positive
- Excellent developer experience with hot reloading and built-in TypeScript support
- App Router provides modern file-based routing with better organization
- Built-in performance optimizations (image optimization, code splitting)
- Strong ecosystem and community support
- Good documentation and learning resources
- Server components support for future scalability
- Zero-config deployment with Vercel

### Negative
- Learning curve for developers unfamiliar with Next.js App Router
- Framework lock-in (though migration paths exist)
- Some complexity for simple client-side apps
- Bundle size overhead compared to plain React

### Neutral
- Requires Node.js development environment
- Opinionated file structure and conventions

## Alternatives Considered

- **Create React App**: Simpler but deprecated and less feature-rich
- **Vite + React Router**: More lightweight but requires more configuration
- **Remix**: Good SSR but smaller ecosystem and steeper learning curve
- **Pages Router**: Older Next.js pattern, less modern than App Router

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [App Router vs Pages Router Comparison](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)