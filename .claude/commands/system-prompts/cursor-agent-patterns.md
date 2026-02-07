# Cursor Agent Patterns

> Best practices extracted from Cursor AI IDE's Agent Prompt 2.0

## Core Philosophy

Cursor operates on a **maximize context understanding** philosophy:
- Be THOROUGH when gathering information
- TRACE every symbol back to definitions and usages
- EXPLORE alternative implementations
- Keep searching until CONFIDENT nothing important remains

---

## Key Patterns

### 1. Semantic Search Strategy

```markdown
# Codebase Search Best Practices

## When to Use Semantic Search
- Exploring unfamiliar codebases
- Asking "how / where / what" questions
- Finding code by meaning, not exact text

## When NOT to Use
- Exact text matches (use grep)
- Reading known files (use read_file)
- Simple symbol lookups (use grep)
- Finding files by name (use file_search)

## Query Formulation
Good: "Where is interface MyInterface implemented in the frontend?"
Bad: "MyInterface frontend" (too vague)

Good: "Where do we encrypt user passwords before saving?"
Bad: "AuthService" (single word - use grep)
```

### 2. Code Reference Format

```markdown
# Citing Existing Code

## Format: startLine:endLine:filepath
\`\`\`12:14:app/components/Todo.tsx
export const Todo = () => {
  return <div>Todo</div>;
};
\`\`\`

## Rules
- NEVER add language tags to code references
- Include at least 1 line of actual code
- Use `// ... existing code ...` for truncation
```

### 3. Edit Patterns

```markdown
# Making Code Changes

## Approach
- Never output code to user unless requested
- Use code edit tools instead
- Ensure code is immediately runnable

## Edit File Tool
- Specify edits in sequence
- Use `// ... existing code ...` for unchanged sections
- Include sufficient context to resolve ambiguity
- Never omit code without the comment marker
```

### 4. Tool Calling Rules

```markdown
# Tool Usage

1. Follow schema exactly - provide ALL parameters
2. Never call unavailable tools
3. Never refer to tool names to user
4. Prefer tool calls over asking user
5. Make a plan, then execute immediately
6. Read files when unsure - don't guess
7. Can read multiple files to clarify questions
```

### 5. Todo System

```markdown
# Task Management

## When to Use
- Complex multi-step tasks (3+ steps)
- Non-trivial planning required
- User provides multiple tasks
- Tracking progress visibility

## When NOT to Use
- Single straightforward tasks
- Trivial tasks
- Conversational requests

## Never Include in Todos
- Linting
- Testing
- Searching/examining codebase
```

---

## Implementation Example

```javascript
// Example: Implementing Cursor-style semantic search handling

const searchStrategy = {
  // Start broad, then narrow
  phase1: {
    query: "How does user authentication work?",
    target: [],  // Search everywhere
    explanation: "Find auth flow"
  },

  // Based on phase1 results, narrow down
  phase2: {
    query: "Where are user roles checked?",
    target: ["backend/auth/"],
    explanation: "Find role logic in identified area"
  }
};

// For large files, use semantic search within file
const largeFileStrategy = {
  query: "How are websocket connections handled?",
  target: ["backend/services/realtime.ts"],
  explanation: "File too large to read entirely"
};
```

---

## Best Practices Summary

| Area | Practice |
|------|----------|
| Search | Start broad, narrow based on results |
| Edit | Use `// ... existing code ...` marker |
| Cite | Use `startLine:endLine:filepath` format |
| Tools | Call parallel when independent |
| Todos | Track complex multi-step work |
| Code | Ensure immediately runnable |

---

## Applying to Your Projects

1. **Add to .cursorrules**:
```
# Agent Behavior
- Use semantic search for "how/where/what" questions
- Read files before modifying
- Track progress with todo system
- Ensure code is immediately runnable
```

2. **In AGENTS.md**:
```markdown
## Search Strategy
- Start with exploratory queries
- Narrow down based on results
- Use grep for exact matches
```

**Source**: Cursor Agent Prompt 2.0
