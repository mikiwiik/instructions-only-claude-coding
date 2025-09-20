---
name: Major Feature Implementation
about: Template for implementing significant features requiring architectural decisions
title: '[FEATURE] '
labels: 'enhancement'
assignees: ''
---

## Summary

Brief description of the feature to be implemented.

## Requirements

### Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Technical Requirements
- [ ] Technical requirement 1
- [ ] Technical requirement 2
- [ ] Technical requirement 3

## Implementation Approach

### Complexity Assessment
- **Estimated Complexity**: [minimal/simple/moderate/complex/epic]
- **Affected Components**: List components/files that will be modified
- **Dependencies**: List any dependencies or blocking issues

### Technical Considerations
- Architecture impact
- Performance considerations
- Testing strategy
- Migration requirements (if applicable)

## Documentation Updates Required

**🚨 CRITICAL**: Major features require documentation consistency across multiple files.

### ADR Requirements
- [ ] **Create ADR**: Document architectural decisions and rationale
- [ ] **Update ADR Index**: Add entry to `docs/adr/README.md`
- [ ] **Reference ADR**: Link from CLAUDE.md and README.md where relevant

### CLAUDE.md Updates
- [ ] **Development Guidelines**: Update workflow or coding standards if affected
- [ ] **Project Structure**: Update if directory organization changes
- [ ] **Quality Standards**: Update if testing or review processes change
- [ ] **Tool Requirements**: Update if new tools or dependencies are added

### README.md Updates
- [ ] **Project Overview**: Update if feature changes project scope or purpose
- [ ] **Setup Instructions**: Update if installation/configuration changes
- [ ] **Contributor Guidelines**: Update if development workflow changes
- [ ] **Feature Documentation**: Add feature description and usage examples

### Cross-Reference Maintenance
- [ ] **Link ADR**: Reference ADR from CLAUDE.md and README.md
- [ ] **Update Guidelines**: Create or update relevant guidelines documentation
- [ ] **Verify Links**: Ensure all cross-references are functional and current

### Consistency Verification
- [ ] **Review All Documents**: Ensure consistent terminology and approach
- [ ] **Test Instructions**: Verify all updated instructions work correctly
- [ ] **Check Completeness**: Confirm all necessary documentation is included

## Acceptance Criteria

### Feature Implementation
- [ ] Core functionality implemented and tested
- [ ] All requirements met
- [ ] Code follows project standards
- [ ] Tests provide adequate coverage

### Documentation Completion
- [ ] All required documentation updates completed
- [ ] Documentation consistency verified across all files
- [ ] Cross-references updated and functional
- [ ] Instructions tested and verified

## Testing Strategy

### Unit Tests
- [ ] Test plan defined
- [ ] Tests implemented
- [ ] Coverage requirements met

### Integration Tests
- [ ] Integration scenarios identified
- [ ] Tests implemented
- [ ] End-to-end workflows verified

### Documentation Testing
- [ ] Setup instructions tested
- [ ] All documentation links verified
- [ ] Cross-references confirmed functional

## Priority and Labels

- **Priority**: [priority-1-critical/priority-2-high/priority-3-medium/priority-4-low]
- **Complexity**: [complexity-minimal/complexity-simple/complexity-moderate/complexity-complex/complexity-epic]
- **Additional Labels**: [enhancement, documentation, adr, etc.]

---

**Note**: This template ensures comprehensive documentation maintenance for major features. Follow the documentation consistency requirements in `docs/guidelines/documentation-standards.md` for detailed guidance.