# Multi-Platform Prompt Engineering

> How to create prompts that work across Claude Code, Cursor, Windsurf, Cline, and more

## Overview

This guide provides patterns for writing platform-agnostic AI agent instructions that work effectively across all major AI coding assistants.

---

## Universal Prompt Structure

```markdown
# [Your Project/Agent Name]

## Identity
[Who the agent is and its primary purpose]

## Core Rules
[Non-negotiable behaviors]

## Code Style
[Language-specific conventions]

## Tool Usage
[How to use available tools]

## Communication
[How to interact with users]

## Forbidden
[What never to do]
```

---

## Platform Compatibility Matrix

| Feature | Claude Code | Cursor | Windsurf | Cline | VSCode Agent |
|---------|-------------|--------|----------|-------|--------------|
| AGENTS.md | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| .cursorrules | ❌ | ✅ | ❌ | ❌ | ❌ |
| .windsurfrules | ❌ | ❌ | ✅ | ❌ | ❌ |
| .clinerules | ❌ | ❌ | ❌ | ✅ | ❌ |
| CLAUDE.md | ✅ | ❌ | ❌ | ❌ | ❌ |
| Todo System | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Memory | ⚠️ | ✅ | ✅ | ❌ | ⚠️ |
| MCP | ✅ | ⚠️ | ⚠️ | ✅ | ❌ |

✅ = Full support  ⚠️ = Partial/Varies  ❌ = Not supported

---

## Universal Instructions (All Platforms)

### 1. Code Style Section

```markdown
## Code Style

### Always
- Use TypeScript with strict mode
- Prefer functional programming patterns
- Handle errors explicitly with try-catch
- Add all necessary imports
- Follow existing code conventions

### Never
- Use `any` types
- Leave console.log in production
- Use inline styles
- Create security vulnerabilities
- Introduce magic numbers
```

### 2. Communication Section

```markdown
## Communication

### Tone
- Be concise and direct
- Technical focus
- No filler phrases ("Great", "Certainly", "Sure")
- Use markdown formatting
- Code blocks with language tags

### Format
- File paths in backticks: `src/utils.ts`
- Tables for structured data
- Bullet points for lists
- Headers to organize responses
```

### 3. Behavior Section

```markdown
## Behavior

### Before Modifying Files
1. Read the file first
2. Understand existing patterns
3. Plan minimal changes
4. Preserve existing functionality

### During Development
1. Add proper error handling
2. Include necessary types
3. Follow project conventions
4. Test changes when possible

### After Changes
1. Verify the changes work
2. Update related code if needed
3. Don't refactor unrelated code
```

---

## Platform-Specific Adaptations

### Claude Code

```markdown
# CLAUDE.md additions

## Claude Code Specific
- Use TodoWrite tool for complex tasks
- Use Task tool for specialized agents
- Prefer parallel tool calls when independent
- Mark todos complete immediately
```

### Cursor

```markdown
# .cursorrules additions

## Cursor Specific
- Use semantic search for "how/where/what" queries
- Use grep for exact text matching
- Cite code with startLine:endLine:filepath format
- Maximize context understanding
```

### Windsurf

```markdown
# .windsurfrules additions

## Windsurf Specific
- Update plan before significant actions
- Create memories proactively
- Premium web design aesthetics
- Browser preview after web changes
```

### Cline

```markdown
# .clinerules additions

## Cline Specific
- One tool per message
- Wait for confirmation
- SEARCH/REPLACE for edits
- Plan mode for complex tasks
```

---

## Cross-Platform Patterns

### 1. Tool Usage Pattern

```markdown
# Works across all platforms

## Tool Strategy
- Research before modifying
- Read files before editing
- Verify success before proceeding
- Handle errors gracefully

## Parallel Operations
When tools are independent:
- Run file reads in parallel
- Batch similar operations
- Don't wait unnecessarily

When tools depend on each other:
- Wait for results
- Use output as input
- Validate before proceeding
```

### 2. Task Tracking Pattern

```markdown
# Works across all platforms

## Task Management
For complex tasks (3+ steps):
1. Create a task list
2. Work through sequentially
3. Mark complete when done
4. Update user on progress

## Progress Updates
- Brief status after significant work
- List completed items
- Note remaining work
- State next action
```

### 3. Error Handling Pattern

```markdown
# Works across all platforms

## When Errors Occur
1. Understand the error
2. Read relevant context
3. Plan a fix
4. Implement solution
5. Verify fix works

## Don't
- Give up immediately
- Guess at solutions
- Ignore error messages
- Skip verification
```

---

## AGENTS.md Template

```markdown
# AGENTS.md - Universal AI Agent Configuration

> Configuration compatible with all AI coding assistants

## Project Info
- **Name**: [Project Name]
- **Type**: [Web App / API / Library]
- **Stack**: [TypeScript, React, etc.]

## Code Style
- TypeScript with strict mode
- Functional patterns preferred
- Async/await over Promise chains
- Explicit error handling

## Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | UserProfile |
| Functions | camelCase | getUserData |
| Constants | UPPER_SNAKE | API_URL |
| Files | kebab-case | user-profile.tsx |

## Best Practices
- No `any` types
- Small, focused functions
- DRY principle
- Test critical paths

## Forbidden
- console.log in production
- Inline styles
- Magic numbers
- Direct state mutation

## Security
- No exposed secrets
- Validate user input
- Parameterized queries
- Sanitize HTML output
```

---

## Combining Platform Instructions

### Option 1: Single AGENTS.md

```markdown
# AGENTS.md

## Universal Instructions
[Common to all platforms]

## Platform-Specific
<!-- Claude Code -->
[Claude-specific additions]

<!-- Cursor -->
[Cursor-specific additions]

<!-- Windsurf -->
[Windsurf-specific additions]
```

### Option 2: Multiple Files

```
project/
├── AGENTS.md              # Universal
├── CLAUDE.md              # Claude Code specific
├── .cursorrules           # Cursor specific
├── .windsurfrules         # Windsurf specific
└── .clinerules            # Cline specific
```

---

## Best Practices Summary

| Principle | Implementation |
|-----------|---------------|
| Universal Core | Common rules in AGENTS.md |
| Platform Adapt | Specific files for each |
| Consistency | Same conventions everywhere |
| Specificity | Platform features in platform files |
| Maintenance | Update AGENTS.md first, then sync |

---

## Using with namnam-skills

```bash
# Install platform configs
npx namnam-skills platforms

# Files generated:
# - AGENTS.md (universal)
# - .cursorrules (Cursor)
# - .windsurfrules (Windsurf)
# - .clinerules (Cline)
```

**Source**: Analysis of 30+ AI coding assistant system prompts
