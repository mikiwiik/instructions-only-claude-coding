# ADR-005: Use localStorage for data persistence

## Status

Accepted

## Context

Our Todo application needs data persistence so users don't lose their todos between browser sessions. Considerations:

- Simple client-side storage for MVP
- No server infrastructure requirements
- User privacy and data ownership
- Storage limitations and browser support
- Offline functionality
- Development complexity

## Decision

Use browser localStorage as the primary data persistence mechanism for the Todo application.

## Consequences

### Positive

- No server infrastructure required
- Simple implementation and testing
- Instant data persistence without network requests
- Works offline by default
- User data stays on their device (privacy benefit)
- No authentication or user management complexity
- Fast read/write operations
- Good browser support across modern browsers

### Negative

- Data is tied to specific browser/device
- Storage quota limitations (typically 5-10MB)
- No data sharing between devices
- Data loss if user clears browser data
- No backup or recovery mechanism
- Synchronous API can block main thread for large data
- Not suitable for collaborative features

### Neutral

- Requires fallback handling for browsers without localStorage
- Need error handling for quota exceeded scenarios
- Data format must be JSON-serializable

## Alternatives Considered

- **IndexedDB**: More powerful but complex for simple key-value storage
- **Server Database**: Requires backend infrastructure and authentication
- **Cloud Storage APIs**: Complex setup and user account requirements
- **File System Access API**: Limited browser support and user friction
- **WebSQL**: Deprecated technology

## References

- [MDN localStorage Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Web Storage API Browser Support](https://caniuse.com/namevalue-storage)
- [localStorage Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
