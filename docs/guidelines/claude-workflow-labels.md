# Claude-Workflow Label Usage Guidelines

This document provides comprehensive guidelines for using the `claude-workflow` label in the Todo App project for issues related to Claude Code usage, AI collaboration, and instruction-based development methodology.

## Label Definition

> **claude-workflow** 🟣: Issues related to Claude Code usage, instructions, AI collaboration patterns, and agentic coding methodology improvements.

The `claude-workflow` label identifies issues that specifically relate to improving how humans and AI collaborate in this instruction-only development project, rather than general software development tasks.

## When to Use claude-workflow Label

### Primary Use Cases

**✅ Use claude-workflow for:**

1. **AI Instruction Improvements** 🔧
   - Enhancing Claude Code instruction clarity and effectiveness
   - Improving AI collaboration patterns and workflows
   - Refining instruction-based development practices
   - Updates to CLAUDE.md guidance and requirements

2. **Agentic Coding Methodology** ⚙️
   - Process improvements for instruction-only development
   - Human-AI role definition and boundary clarification
   - Task planning protocols and methodologies
   - Quality assurance through AI implementation

3. **Claude Code Integration** 🛠️
   - Claude Code environment configuration and setup
   - Tool integration and optimization issues
   - Development environment improvements for AI assistance
   - Authentication and access configuration

4. **Documentation and Guidelines** 📚
   - AI collaboration best practices documentation
   - Instruction methodology documentation updates
   - Cross-reference maintenance between AI-related docs
   - Learning and knowledge sharing about agentic coding

5. **Issue Management for AI Workflows** 📋
   - Issue creation and labeling processes for AI development
   - PR completion and closure workflow improvements
   - Documentation consistency requirements
   - Quality standards for AI-assisted development

### Exclusions

**❌ Do NOT use claude-workflow for:**

- General development workflow (git, CI/CD, testing) - use standard labels
- Feature implementations or bug fixes - focus on the functionality, not the AI aspect
- UI/UX improvements - unless specifically about AI interaction patterns
- Infrastructure or deployment changes - unless related to Claude Code setup
- Standard project management tasks - unless they're specifically about AI collaboration

## Issue Categories and Examples

### 1. Instruction Improvement Issues 🔧

**Characteristics:**

- Focus on making AI instructions clearer and more effective
- Improve human-AI communication patterns
- Enhance instruction-based development practices

**Real Examples from Project:**

- #59: "Improve Claude instruction: Mandatory issue closure and PR completion workflow"
- #61: "Document claude-workflow label usage and integration guidelines" (this issue)
- Updates to task planning protocols in CLAUDE.md

**Typical Patterns:**

```
feat: improve Claude instruction for [specific workflow]
docs: clarify AI collaboration guidelines for [specific process]
process: enhance instruction-based [specific methodology]
```

### 2. Workflow Enhancement Issues ⚙️

**Characteristics:**

- Optimize Claude Code integration with development processes
- Improve AI-assisted workflow efficiency
- Enhance agentic coding methodology

**Examples:**

- Claude Code agent implementations for specialized tasks
- Task planning protocol improvements
- Quality assurance process optimization through AI

**Typical Patterns:**

```
workflow: implement Claude Code agents for [specialized function]
process: optimize AI task planning for [specific workflow]
enhance: improve agentic coding [specific methodology]
```

### 3. Documentation and Guidelines Issues 📚

**Characteristics:**

- Create or improve documentation about AI collaboration
- Establish best practices for instruction-based development
- Maintain knowledge about agentic coding methodology

**Examples:**

- Cross-reference maintenance between CLAUDE.md, README.md, and ADRs
- Best practices documentation for AI collaboration
- Learning documentation about effective instruction patterns

**Typical Patterns:**

```
docs: create guidelines for [AI collaboration aspect]
guide: document best practices for [instruction-based process]
knowledge: capture learnings about [agentic coding methodology]
```

### 4. Configuration and Setup Issues 🛠️

**Characteristics:**

- Claude Code environment configuration
- Tool integration and setup for AI assistance
- Development environment optimization

**Examples:**

- Claude Code authentication and access setup
- Integration with GitHub, VS Code, or other development tools
- Environment configuration for optimal AI assistance

**Typical Patterns:**

```
setup: configure Claude Code for [specific environment]
config: optimize [tool] integration with Claude Code
env: improve development environment for AI assistance
```

## Integration with Other Labels

### Required Label Combinations

**All claude-workflow issues MUST include:**

- **Priority label**: priority-1-critical through priority-4-low
- **Complexity label**: complexity-minimal through complexity-epic

### Common Label Patterns

#### High-Priority AI Workflow Issues

```bash
--label "claude-workflow,priority-1-critical,complexity-simple"
```

**Use for:** Urgent AI collaboration blockers or critical instruction improvements

#### Documentation and Guidelines

```bash
--label "claude-workflow,documentation,priority-2-high,complexity-simple"
```

**Use for:** AI collaboration documentation that needs immediate attention

#### Process Improvements

```bash
--label "claude-workflow,process-improvement,priority-2-high,complexity-moderate"
```

**Use for:** Comprehensive workflow enhancements for AI collaboration

#### Configuration and Setup

```bash
--label "claude-workflow,enhancement,priority-3-medium,complexity-simple"
```

**Use for:** Tool configuration and environment optimization

### Integration Guidelines

1. **Priority Assessment**: claude-workflow issues should be prioritized based on their impact on AI collaboration effectiveness
2. **Complexity Estimation**: Consider both technical complexity and the need for methodology understanding
3. **Additional Labels**: Combine with standard labels (documentation, enhancement, process-improvement) as appropriate

## Best Practices

### Issue Creation

1. **Clear AI Focus**: Explicitly explain how the issue relates to Claude Code or AI collaboration
2. **Methodology Context**: Reference relevant sections of CLAUDE.md or agentic coding practices
3. **Instruction Clarity**: For instruction improvements, provide before/after examples
4. **Workflow Impact**: Explain how the change improves human-AI collaboration

### Issue Description Template

```markdown
## AI Collaboration Context
[Explain how this relates to Claude Code usage or agentic coding]

## Current State
[Describe current AI instruction or workflow state]

## Proposed Improvement
[Detail the specific improvement to AI collaboration]

## Expected Benefits
[Explain how this enhances instruction-based development]

## Implementation Notes
[Any specific considerations for AI-assisted implementation]
```

### Progress Tracking

- Use TodoWrite tool for complex claude-workflow implementations
- Reference CLAUDE.md sections that are affected
- Document lessons learned about AI collaboration
- Update related documentation consistently

## Historical Analysis and Application

### Existing Issues with claude-workflow Label

Current issues properly labeled with claude-workflow:

- #59: Improve Claude instruction - Mandatory issue closure and PR completion workflow
- #61: Document claude-workflow label usage and integration guidelines
- #67: Document screenshot handling protocol for Claude Code
- #38: Implement Claude Code agents for specialized development tasks
- #11: Infrastructure - Run Locally in Docker (AI development environment)

### Issues That Should Have claude-workflow Label

**Methodology and Process Issues:**

- Any issues about improving CLAUDE.md content
- Task planning protocol improvements
- AI collaboration pattern enhancements
- Instruction-based development methodology updates

**Documentation Issues:**

- Cross-reference maintenance between AI-related documentation
- Guidelines for effective AI collaboration
- Best practices for instruction-only development

## Maintenance and Evolution

### Regular Review Process

1. **Monthly Label Audit**: Review all claude-workflow issues for proper categorization
2. **Documentation Updates**: Keep guidelines current with evolving AI collaboration practices
3. **Pattern Analysis**: Identify emerging patterns in claude-workflow issues
4. **Best Practice Evolution**: Update guidelines based on practical experience

### Success Metrics

- **Clear Categorization**: Easy identification of AI-related issues
- **Improved Discoverability**: Effective filtering for Claude Code workflow improvements
- **Consistent Application**: Standardized usage across all contributors
- **Enhanced Collaboration**: Better organization of AI methodology improvements

## Integration with Project Workflows

### Issue Creation Checklist

For any issue that might be claude-workflow related, ask:

- [ ] Does this issue involve Claude Code usage or instructions?
- [ ] Is this about AI collaboration patterns or methodologies?
- [ ] Does this affect instruction-based development practices?
- [ ] Is this related to agentic coding methodology improvements?

If yes to any, add the claude-workflow label.

### Development Workflow Integration

- **Feature Development**: Consider claude-workflow label for features that change how AI assists development
- **Documentation Updates**: Always use claude-workflow for CLAUDE.md and related AI documentation changes
- **Process Improvements**: Use claude-workflow for any process that affects human-AI collaboration
- **Knowledge Capture**: Use claude-workflow for documenting learnings about AI-assisted development

## Related Documentation

- **Priority System**: [docs/guidelines/priority-system.md](priority-system.md)
- **Complexity Estimation**: [docs/guidelines/complexity-estimation.md](complexity-estimation.md)
- **Project Management**: [docs/development/project-management.md](../development/project-management.md)
- **Claude Instructions**: [CLAUDE.md](../../CLAUDE.md)

---

This documentation ensures consistent and effective use of the claude-workflow label to improve AI collaboration and instruction-based development methodology in the Todo App project.
