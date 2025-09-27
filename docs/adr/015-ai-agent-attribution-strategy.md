# ADR-015: AI Agent Attribution Strategy

## Status

Accepted

## Context

Currently all AI Agent activities (commits, issues, PRs) are attributed to personal developer accounts.
This creates ambiguity about what work was done by humans versus AI coding assistants, making it difficult to:

- Distinguish AI-assisted work from manual contributions
- Track the effectiveness of AI coding assistance
- Maintain clear accountability and transparency in development
- Provide proper attribution for collaboration between humans and AI

This decision establishes a clear attribution strategy that can be used by any developer working with AI
coding assistants like Claude Code, GitHub Copilot, or similar tools.

## Decision

Implement a dual-account attribution system using dedicated AI agent GitHub accounts with the following approach:

1. **Dedicated AI Agent Account**: Create separate GitHub account with email alias (`{user}+agent@domain.com`)
2. **Repository-based Git Configuration**: Use `.gitconfig` in repository root for automatic attribution
3. **Standardized Commit Messages**: Include AI attribution footer (`🤖 Generated with AI Agent`) and co-author trailers
4. **Clear Account Switching**: Document procedures for switching between personal and agent accounts
5. **Collaboration Preservation**: Maintain co-authoring to credit both AI and human contributors

## Consequences

### Positive

- **Clear Attribution**: Immediate visual distinction between human and AI work in commit history
- **Transparency**: Open acknowledgment of AI assistance in development process
- **Professional Standards**: Demonstrates thoughtful approach to AI-assisted development
- **Reusable Pattern**: Provides template other developers can follow
- **Collaboration Tracking**: Maintains proper credit through co-authoring
- **Repository-based Setup**: Automatic configuration when working in the project

### Negative

- **Additional Setup**: Requires creating and managing additional GitHub account
- **Account Switching**: Need to remember to switch between accounts appropriately
- **Commit Message Overhead**: Slightly longer commit messages with attribution footers

### Neutral

- **GitHub Analytics**: AI agent account will show as separate contributor in repository insights
- **Historical Record**: Creates permanent record of when AI assistance was used in project development

## Alternatives Considered

- **No Attribution**: Continue current approach with no distinction between human and AI work
  - Rejected: Lacks transparency and makes it difficult to track AI assistance effectiveness

- **Commit Message Only**: Add AI attribution only in commit messages without separate account
  - Rejected: Doesn't provide clear visual distinction in GitHub interface

- **Branch Naming**: Use branch naming conventions to indicate AI work
  - Rejected: Doesn't carry through to final commit history and main branch

- **Git Author vs Committer**: Use different author/committer fields for attribution
  - Rejected: Less clear and not well supported by GitHub UI

## References

- [GitHub Issue #127](https://github.com/mikiwiik/instructions-only-claude-coding/issues/127)
- [Git Co-authored-by Documentation](https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors)
- [Repository-based Git Configuration](https://git-scm.com/docs/git-config#Documentation/git-config.txt-includepathorlltpathgt)
