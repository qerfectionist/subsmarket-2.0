# VSCode Agent Patterns

> Best practices extracted from VSCode Agent with model-specific adaptations

## Core Philosophy

VSCode Agent is designed to work like a **pair programmer**:
- Friendly and helpful
- Proactive solutions
- Think about user needs
- Implement beyond minimum

---

## Key Patterns

### 1. Model-Specific Adaptation

```markdown
# Multi-Model Support

VSCode Agent has prompts for:
- Claude Sonnet 4
- Gemini 2.5 Pro
- GPT-4.1
- GPT-4o
- GPT-5
- GPT-5 mini

## Adaptation Strategy
- Same core instructions
- Model-specific optimizations
- Tool schema adjustments
- Response formatting differences
```

### 2. Todo List System (CRITICAL)

```markdown
# Task Tracking - NEVER SKIP

## ALWAYS Start With Todo List
- Multi-step tasks REQUIRE todo list
- Track progress visibly
- Update as you work

## Todo Actions
- Create todos immediately
- Mark in_progress when starting
- Mark completed when done
- Remove obsolete items

## Format
- Clear item descriptions
- Status tracking
- Logical ordering
```

### 3. Tool Batching

```markdown
# Parallel Execution

## Batch Preamble Required
"One-sentence why/what/outcome preamble"

## Progress Checkpoints
After 3-5 tool calls OR >3 file edits:
- Pause and post compact checkpoint
- Summarize progress
- State what's next

## Semantic Search Exception
- Do NOT call semantic_search in parallel
- Always sequential for search
```

### 4. Requirements Coverage

```markdown
# No Requirement Left Behind

## Process
1. Read user's ask in FULL
2. Extract EACH requirement to checklist
3. Keep checklist visible
4. Do NOT omit any requirement

## If Cannot Complete
- Note WHY briefly
- Propose viable alternative
- Don't just skip it
```

### 5. Notebook Support

```markdown
# Jupyter Notebook Handling

## Tools
- edit_notebook_file: Edit cells
- run_notebook_cell: Execute cells
- copilot_getNotebookSummary: Get cell overview

## Rules
- Use cell NUMBER, not Cell ID in messages
- Markdown cells cannot be executed
- Never run jupyter commands in terminal
```

---

## Implementation Examples

### Todo List Usage

```javascript
// Example: Proper todo list management

const todoList = {
  items: [
    { id: 1, content: "Analyze requirements", status: "completed" },
    { id: 2, content: "Create database schema", status: "in_progress" },
    { id: 3, content: "Implement API endpoints", status: "pending" },
    { id: 4, content: "Add authentication", status: "pending" },
    { id: 5, content: "Write tests", status: "pending" }
  ],

  // Merge updates (don't replace all)
  update: function(changes) {
    return this.items.map(item => {
      const change = changes.find(c => c.id === item.id);
      return change ? { ...item, ...change } : item;
    });
  }
};
```

### Requirement Extraction

```javascript
// Example: Extract all requirements from user request

const userRequest = `
Add authentication with:
- Email/password login
- OAuth (Google, GitHub)
- Password reset via email
- Remember me functionality
- Rate limiting
`;

const requirements = [
  { id: 1, text: "Email/password login", done: false },
  { id: 2, text: "OAuth - Google", done: false },
  { id: 3, text: "OAuth - GitHub", done: false },
  { id: 4, text: "Password reset via email", done: false },
  { id: 5, text: "Remember me functionality", done: false },
  { id: 6, text: "Rate limiting", done: false }
];

// Keep visible throughout implementation
// Check off as completed
// Don't drop any
```

### Progress Checkpoint

```javascript
// Example: Checkpoint after significant work

const checkpoint = `
## Progress Checkpoint

### Completed (3/6)
✅ Email/password login
✅ OAuth - Google
✅ OAuth - GitHub

### In Progress
🔄 Password reset via email

### Remaining
⬜ Remember me functionality
⬜ Rate limiting

### Next Steps
1. Complete email reset flow
2. Add remember me checkbox
3. Implement rate limiter middleware
`;
```

---

## Best Practices Summary

| Area | VSCode Agent Approach |
|------|----------------------|
| Todo List | MANDATORY, never skip |
| Models | Adapt to specific model |
| Batching | Preamble + checkpoints |
| Requirements | Extract ALL, don't omit |
| Notebooks | Use dedicated tools |
| Identity | Never reveal model name |

---

## Communication Rules

```markdown
# Response Format

## Skip Filler
Bad: "Sounds good, I'll..."
Good: "Searching for auth modules..."

## Opening
- Purposeful one-liner
- What you're doing next
- No acknowledgements

## Delta Updates
- Don't repeat unchanged sections
- Show only what changed
- Avoid verbose todo restating

## Setup Commands
- Fenced code blocks
- Correct language tags
- Copyable on separate lines
```

---

## Important Reminders (from prompt)

```markdown
# Critical Rules

1. Before starting, review:
   - responseModeHints
   - engineeringMindsetHints
   - requirementsUnderstanding

2. Start response with:
   - Brief task receipt
   - Concise high-level plan

3. Use todo list tool to:
   - Plan tasks
   - Track progress
   - NEVER skip this step

4. Verify before claiming:
   - Don't assume build/runtime setup
   - Test runnable code yourself
   - State what's known from context
```

---

## Applying to Your Projects

1. **Implement Todo Tracking**:
```javascript
// Always track multi-step tasks
if (isMultiStepTask(request)) {
  await createTodoList(extractRequirements(request));
  await markInProgress(firstTodo);
}
```

2. **In AGENTS.md**:
```markdown
## Task Management
- Use todo list for 3+ step tasks
- Mark progress in real-time
- Extract ALL requirements
- Don't omit any

## Checkpoints
- After 3-5 tool calls
- After >3 file edits
- Before ending turn
```

**Source**: VSCode Agent System Prompt (Claude Sonnet 4 variant)
