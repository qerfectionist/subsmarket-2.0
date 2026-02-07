# /feature-dev - Structured Feature Development

7-phase structured feature development workflow with specialized agents.

## Usage

```
/feature-dev implement user authentication
/feature-dev add dark mode support
/feature-dev create payment integration
```

## Instructions

When the user invokes `/feature-dev`:

### Phase 1: Discovery
Use `code-explorer` agent to:
- Understand current codebase structure
- Identify relevant files and patterns
- Map dependencies

### Phase 2: Architecture
Use `code-architect` agent to:
- Design the feature architecture
- Define interfaces and contracts
- Plan file structure changes

### Phase 3: Planning
Create detailed implementation plan:
- Break down into tasks
- Identify potential blockers
- Estimate complexity

### Phase 4: Implementation
Execute the plan:
- Write code following existing patterns
- Maintain consistency with codebase
- Add appropriate error handling

### Phase 5: Testing
Write and run tests:
- Unit tests for new functions
- Integration tests for feature
- Edge case coverage

### Phase 6: Review
Use `code-reviewer` agent to:
- Check code quality
- Verify architecture compliance
- Identify potential issues

### Phase 7: Documentation
Update docs:
- Add inline comments where needed
- Update README if applicable
- Document API changes

## Agents Used

| Agent | Purpose |
|-------|---------|
| `code-explorer` | Codebase discovery and mapping |
| `code-architect` | Architecture design |
| `code-reviewer` | Code quality review |
