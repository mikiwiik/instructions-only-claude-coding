# ADR-003: Select Tailwind CSS for styling

## Status

Accepted

## Context

We need a CSS strategy for styling our Todo application. Requirements include:

- Rapid development and prototyping
- Consistent design system
- Responsive design capabilities
- Maintainable styling approach
- Good developer experience
- Small bundle size in production

## Decision

Use Tailwind CSS as our primary styling solution with utility-first approach.

## Consequences

### Positive

- Rapid development with utility classes
- Built-in design system with consistent spacing, colors, and typography
- Excellent responsive design utilities
- Automatic CSS purging for optimal bundle size
- No CSS naming conflicts or specificity issues
- Great documentation and IntelliSense support
- Easy to maintain and refactor styles
- Excellent integration with Next.js

### Negative

- Learning curve for developers used to traditional CSS
- HTML can become verbose with many utility classes
- Less semantic class names
- Requires build process for optimization
- Potential design inconsistencies without discipline

### Neutral

- Opinionated design tokens and spacing scale
- Requires PostCSS setup (handled by Next.js)
- Different mental model from component-scoped CSS

## Alternatives Considered

- **CSS Modules**: Good scoping but requires more custom CSS writing
- **Styled Components**: Component-scoped but larger runtime overhead
- **Emotion**: Similar to Styled Components with better performance
- **Plain CSS**: Simple but harder to maintain consistency
- **Bootstrap**: Component library but less flexible and larger bundle

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Tailwind CSS Integration](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
- [Tailwind UI Components](https://tailwindui.com/)
