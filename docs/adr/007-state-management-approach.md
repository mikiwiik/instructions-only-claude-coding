# ADR-007: Use custom hooks for state management

## Status

Accepted

## Context

We need to choose a state management approach for our Todo application. Considerations:
- Application complexity and scale
- Developer experience and learning curve
- Testing and maintainability
- React ecosystem best practices
- Performance characteristics
- Code organization and reusability

## Decision

Use custom React hooks (useState, useEffect, useContext) for state management instead of external state management libraries.

## Consequences

### Positive
- Leverages built-in React capabilities without external dependencies
- Easier to test with React Testing Library
- Lower learning curve for developers familiar with React
- Better integration with React DevTools
- Simpler debugging and error tracking
- Less boilerplate code for simple state operations
- Natural encapsulation of related state and logic
- Good performance for application of this scale

### Negative
- May not scale well for very complex state interactions
- No built-in time-travel debugging like Redux DevTools
- Potential prop drilling if context is overused
- Manual optimization needed for preventing unnecessary re-renders
- Less standardized patterns compared to Redux

### Neutral
- Requires careful hook design for reusability
- Need to establish conventions for state organization
- Performance considerations for context value changes

## Alternatives Considered

- **Redux Toolkit**: Powerful but overkill for simple Todo app state
- **Zustand**: Lightweight but adds external dependency
- **Jotai**: Atomic state management but adds complexity
- **React Query/SWR**: Excellent for server state but we're using localStorage
- **MobX**: Different paradigm with steeper learning curve

## References

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)