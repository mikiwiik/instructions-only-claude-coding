# ADR-012: Todo Reordering UX Approach

## Status

Partially Superseded by ADR-021 (UX approach still valid, technical implementation updated)
Amended by ADR-034 (ordering data model updated to LexoRank)

> **Note**: The UX approach, accessibility requirements, and interaction patterns defined in this ADR
> remain active and unchanged. Only the technical implementation (library choice) has been superseded
> by ADR-021 to enable React 19 compatibility. The ordering data model has been updated by ADR-034
> to use LexoRank for efficient single-todo sync operations.

## Context

The Todo application requires a reordering feature to allow users to organize their todos according to
their priorities and preferences. This enhancement needs to balance several competing concerns:

1. **Accessibility Requirements**: Must comply with WCAG 2.2 guidelines, particularly Success Criterion 2.5.7
   (Dragging Movements AA), which requires drag-and-drop functionality to have alternative non-dragging methods
2. **User Experience**: Should provide intuitive interaction patterns familiar to modern web users
3. **Mobile Compatibility**: Must work effectively on touch devices with varying screen sizes
4. **Technical Feasibility**: Implementation should align with the project's TDD methodology and existing tech stack
5. **Performance**: Solution should maintain app responsiveness even with large todo lists

The evaluation considered five primary UX patterns:

- **Drag and Drop**: Direct manipulation with touch/mouse
- **Arrow Buttons**: Up/down controls for sequential movement
- **Grab Handle + Drag**: Dedicated drag handles with visual affordances
- **Context Menu**: Right-click/long-press menu with movement options
- **Hybrid Approach**: Combination of multiple interaction methods

Research shows that 2025 best practices require dual-approach systems to ensure accessibility compliance
while providing modern UX patterns.

## Decision

Implement a **Hybrid Drag-and-Drop with Arrow Button Fallbacks** approach using @dnd-kit/sortable with
the following specifications:

### Primary Interface

- **Drag Handle**: Six-dot drag handle icon (⋮⋮) positioned on the left of each todo item
- **Visual Feedback**: Clear drag states with elevation, shadows, and drop indicators
- **Touch Optimization**: Enlarged touch targets (minimum 44px) and optimized drag interactions

### Accessibility Alternative

- **Arrow Buttons**: Up/down arrow buttons positioned on the right of each todo item
- **Keyboard Navigation**: Full keyboard support with Space/Enter activation and arrow key movement
- **Screen Reader Support**: Comprehensive ARIA labels and live region announcements

### Technical Implementation

- **Library**: @dnd-kit/sortable (modern, actively maintained, accessibility-focused)
- **Data Model**: Add `order` field to todo type with sequential positioning
- **Persistence**: Maintain order in localStorage with automatic serialization
- **Performance**: Virtualization considerations for large lists (future enhancement)

### Interaction Design

```text
[⋮⋮] [○] Todo item text [↑] [↓] [✏️] [🗑️]
 │     │                   │   │    │    │
 │     │                   │   │    │    └─ Delete
 │     │                   │   │    └─ Edit
 │     │                   │   └─ Move down
 │     │                   └─ Move up
 │     └─ Toggle completion
 └─ Drag handle
```

## Consequences

### Positive

- **Universal Accessibility**: Complies with WCAG 2.2 requirements with dual interaction methods
- **Familiar UX Patterns**: Drag handles follow established design patterns (Notion, Trello)
- **Mobile Optimized**: Touch-friendly with proper sizing and gesture support
- **Modern Implementation**: @dnd-kit provides excellent developer experience with TypeScript support
- **Performance**: Lightweight library (10kb) with minimal performance impact
- **Future-Proof**: Actively maintained library with ongoing React 18+ support
- **Clear Affordances**: Both drag handles and arrow buttons provide clear interaction cues

### Negative

- **UI Complexity**: Additional UI elements increase visual noise on todo items
- **Implementation Effort**: More complex than single-method approaches requiring multiple interaction patterns
- **Learning Curve**: Users may need to discover both interaction methods
- **Mobile Screen Space**: Arrow buttons consume valuable space on smaller screens
- **Development Time**: Higher initial implementation cost due to dual-method approach

### Neutral

- **Bundle Size**: ~10kb increase for @dnd-kit/sortable dependency
- **Testing Complexity**: Requires testing both drag-and-drop and arrow interactions
- **Maintenance**: Additional UI components to maintain and style

## Alternatives Considered

- **Drag-and-Drop Only**: Rejected due to accessibility concerns and WCAG 2.2 non-compliance
- **Arrow Buttons Only**: Rejected due to poor UX for reordering multiple items and less intuitive interaction
- **Context Menu Approach**: Rejected due to hidden functionality and increased interaction complexity
- **react-beautiful-dnd**: Rejected due to deprecated status and lack of maintenance
- **Swipe Gestures**: Rejected due to limited discoverability and potential conflicts with scroll

## References

- [WCAG 2.2 Success Criterion 2.5.7: Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [@dnd-kit Documentation](https://docs.dndkit.com)
- [Salesforce Accessible Drag and Drop Patterns](https://medium.com/salesforce-ux/4-major-patterns-for-accessible-drag-and-drop-1d43f64ebf09)
- [Nielsen Norman Group: Drag-and-Drop Design Guidelines](https://www.nngroup.com/articles/drag-drop/)
- [Smashing Magazine: Enter The Dragon Drop](https://www.smashingmagazine.com/2018/01/dragon-drop-accessible-list-reordering/)
