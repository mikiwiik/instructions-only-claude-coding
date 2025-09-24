---
description: Set up parallel agent execution for complex issues
argument-hint: <issue-number>
---

Set up parallel agent execution for GitHub issue #$1 using Claude Code's Task tool:

1. **Complexity Assessment**: Verify issue is complexity-moderate or higher
2. **Agent Strategy Planning**: Design 2-3 coordinated agents:
   - **Implementation Agent**: Core feature development
   - **Quality Agent**: Testing and validation
   - **Documentation Agent**: README updates, ADRs if needed
3. **Parallel Execution Setup**: Launch coordinated agents using Task tool with specialized roles
4. **Integration Planning**: Ensure agents deliver compatible, integrated results

**When to Use Parallel Execution**:

- complexity-moderate or higher issues
- Multi-component features (frontend + backend + testing)
- Clear separation of concerns possible
- User hasn't explicitly requested sequential work

**Agent Coordination Patterns**:

- Feature Development (Implementation + Testing + Documentation)
- Infrastructure + Feature (Parallel development streams)
- Research + Implementation (Analysis + Development)

**Expected Outcome**: 30-40% faster delivery with enhanced quality through specialized focus.
