# Issue Prompt Logs (IPLs)

Issue Prompt Logs capture the conversational evolution of requirements and instructions for instruction-only
development methodology. They document how natural language instructions translate into successful implementation outcomes.

## Purpose

IPLs serve multiple purposes in this instruction-only development project:

- **Document instruction patterns** that lead to successful outcomes
- **Capture requirement evolution** through collaborative discussion
- **Provide learning examples** for effective AI collaboration
- **Maintain methodology knowledge** for future development
- **Support educational mission** of demonstrating instruction-only development

## When to Create IPLs

### Required for

- Complex requirements that evolve through discussion
- Issues that demonstrate effective instruction patterns
- Problems that required significant clarification
- Features with educational value for instruction-only development
- Issues labeled with `claude-workflow`

### Optional for

- Simple, straightforward requests
- Minor bug fixes with clear requirements
- Routine maintenance tasks

## File Structure

IPLs follow the naming convention: `###-issue-title.md` where ### matches the GitHub issue number.

Example: `069-task-deletion-confirmation.md` for GitHub issue #69.

## Template Usage

Use the provided template at [`template.md`](template.md) for creating new IPLs.

### Key Sections

1. **Issue Context**: Basic metadata and GitHub issue information
2. **Before Implementation**: Initial user request and problem context
3. **During Implementation**: Clarifying questions and requirement refinements
4. **After Implementation**: Final instructions and lessons learned
5. **Related Issues**: Cross-references to related work

## Integration with Workflow

### Creating IPLs

1. Create IPL file during or after issue discussion
2. Use GitHub issue number for consistent naming
3. Document the conversation evolution accurately
4. Reference related issues and ADRs when applicable

### Maintaining IPLs

- Update during implementation if requirements evolve
- Complete "After Implementation" section when work is finished
- Reference IPLs in commit messages when relevant
- Cross-reference with related GitHub issues

## Educational Value

IPLs demonstrate:

- **Effective instruction patterns** for AI collaboration
- **Requirement refinement techniques** through natural language
- **Collaborative problem-solving approaches** in instruction-only development
- **Learning opportunities** for others adopting this methodology

## Examples

- [`069-task-deletion-confirmation.md`](069-task-deletion-confirmation.md) - Example IPL for UX improvement request

## Relationship to ADRs

While ADRs document technical decisions and their rationale, IPLs focus on the instruction and requirement
evolution process. They complement each other:

- **ADRs**: Technical decisions, architecture choices, implementation approaches
- **IPLs**: Instruction patterns, requirement evolution, collaborative methodology

Both are essential for maintaining knowledge in instruction-only development.

---

*This documentation system supports the instruction-only development methodology demonstrated in this
project.*
