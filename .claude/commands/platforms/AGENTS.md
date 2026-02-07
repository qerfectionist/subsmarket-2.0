# AGENTS.md - Universal AI Agent Configuration

> **Industry-Grade Configuration** compatible with all AI coding assistants
> Powered by insights from Claude Code, Cursor, Windsurf, Cline, VSCode Agent, and 25+ AI platforms

This file is automatically read by:
- **Claude Code** (Anthropic) - Primary support
- **Cursor** (reads AGENTS.md as fallback)
- **Windsurf** (reads AGENTS.md as fallback)
- **Cline** (reads AGENTS.md)
- **OpenAI Codex** (reads project context)
- **Aider** (reads project context)
- **Google Gemini** (reads GEMINI.md)

---

## Project Overview

| Property | Value |
|----------|-------|
| **Name** | [Your Project Name] |
| **Type** | [Web App / API / Library / CLI] |
| **Stack** | TypeScript, React/Next.js, Node.js |
| **Test Framework** | Vitest / Jest / Playwright |
| **Package Manager** | npm / pnpm / yarn |

---

## Universal Agent Behavior

### Core Philosophy
```
1. Research before modifying - NEVER guess
2. Read files before editing
3. Verify success before proceeding
4. Handle errors gracefully
5. Complete tasks autonomously
6. Ask only when genuinely blocked
```

### Communication Style
- **Concise**: Keep responses short and direct
- **Technical**: Focus on facts, not validation
- **No filler**: Never start with "Great", "Certainly", "Sure"
- **Markdown**: Use proper formatting, backticks for code
- **Direct**: Answer questions, don't explain obvious things

### Task Execution Model
```
1. Analyze the request fully
2. Extract ALL requirements to checklist
3. Research and gather context
4. Plan minimal, focused changes
5. Execute with proper error handling
6. Verify changes work
7. Update progress tracking
```

---

## Code Style

### Always Do
| Rule | Reason |
|------|--------|
| Use TypeScript strict mode | Type safety |
| Prefer async/await | Readability |
| Handle errors with try-catch | Robustness |
| Add all necessary imports | Immediate runnable |
| Follow existing conventions | Consistency |
| Use functional patterns | Predictability |

### Never Do
| Rule | Reason |
|------|--------|
| Use `any` types | Type safety |
| Leave console.log | Production cleanliness |
| Use inline styles | Maintainability |
| Use magic numbers | Readability |
| Mutate state directly | Predictability |
| Skip error handling | Reliability |

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserData` |
| Constants | UPPER_SNAKE | `API_BASE_URL` |
| Files | kebab-case | `user-profile.tsx` |
| Types | PascalCase | `UserData` |
| Hooks | camelCase with use | `useUserAuth` |
| Test files | *.test.ts / *.spec.ts | `auth.test.ts` |

---

## Project Structure

```
src/
├── app/              # Next.js app router / Entry points
├── components/       # React components
│   ├── ui/           # Base UI components (Button, Input, etc.)
│   └── features/     # Feature-specific components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and helpers
├── types/            # TypeScript type definitions
├── server/           # Server-side code / API routes
├── services/         # External service integrations
├── stores/           # State management (Zustand, etc.)
└── tests/            # Test files (if not co-located)
```

---

## Tool Usage Patterns

### Research First (CRITICAL)
```
Before ANY modification:
1. Read the target file
2. Understand existing patterns
3. Check related files
4. Identify dependencies
5. Plan minimal changes
```

### Parallel Execution
```
When operations are independent:
- Run file reads in parallel
- Batch similar operations
- Don't wait unnecessarily

When operations depend on each other:
- Wait for results
- Validate outputs
- Use results as inputs
```

### Task Tracking
```
For complex tasks (3+ steps):
1. Create todo list immediately
2. Mark items in_progress when starting
3. Mark complete when finished
4. Update progress regularly
5. Don't batch completions
```

---

## Security Requirements

### Absolute Rules
- **NEVER** expose API keys in code
- **NEVER** commit secrets to repository
- **NEVER** log sensitive information
- **NEVER** skip input validation
- **NEVER** use eval() or similar

### Always Do
- Validate all user input
- Use parameterized database queries
- Sanitize HTML output
- Implement proper authentication
- Use HTTPS for external requests
- Follow OWASP guidelines

---

## Preferred Libraries

| Purpose | Library | Alternative |
|---------|---------|-------------|
| State Management | Zustand | React Query / Jotai |
| Forms | React Hook Form | Formik |
| Validation | Zod | Yup |
| Styling | Tailwind CSS | CSS Modules |
| Testing (Unit) | Vitest | Jest |
| Testing (E2E) | Playwright | Cypress |
| HTTP Client | Axios | fetch API |
| Dates | date-fns | dayjs |

---

## AI Agent Behavior

### When Generating Code
1. Follow existing patterns in the codebase
2. Use TypeScript types from `src/types`
3. Match the existing code style exactly
4. Add appropriate error handling
5. Include all necessary imports
6. Ensure code runs immediately

### When Modifying Code
1. Read the file first (ALWAYS)
2. Preserve existing functionality
3. Keep changes minimal and focused
4. Update related tests if needed
5. Don't refactor unrelated code
6. Verify changes work

### When Asked to Review
1. Check for security issues first
2. Verify type safety
3. Look for performance problems
4. Identify missing error handling
5. Suggest improvements constructively

### When Debugging
1. Understand the error fully
2. Read relevant context
3. Identify root cause (not symptoms)
4. Plan a fix
5. Implement and verify
6. Don't guess at solutions

---

## Custom Commands (Claude Code)

### Available Skills
| Command | Description |
|---------|-------------|
| `/namnam <task>` | Orchestrate multiple agents |
| `/namnam --full <task>` | Maximum power mode |
| `/code-review` | Multi-aspect code review |
| `/validate-and-fix` | Run checks and auto-fix |
| `/git:commit` | Smart commit with message |
| `/git:push` | Smart push with checks |
| `/research <topic>` | Deep research with citations |

### For Other Platforms
When using Cursor, Windsurf, Cline, or other agents:
- Reference this file for project conventions
- Follow the structure and naming rules
- Use the preferred libraries
- Avoid forbidden patterns
- Maintain code style consistency

---

## Web Development Standards

### Design Philosophy
- **Visual Excellence**: Users should be impressed at first glance
- **Modern Aesthetics**: Use contemporary design patterns
- **Premium Feel**: No basic/simple designs
- **Dynamic**: Micro-animations, hover effects
- **Responsive**: Works on all devices

### Implementation
1. Build design system first (tokens, utilities)
2. Create reusable components
3. Assemble pages with proper routing
4. Polish with transitions and animations
5. Optimize for performance

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast compliance
- Screen reader support

---

## Memory & Context

### What to Remember
- Important architectural decisions
- User preferences and patterns
- Project-specific conventions
- Previous solutions to similar problems
- Known issues and workarounds

### Knowledge Discovery
- Check existing documentation first
- Build on prior analysis
- Avoid redundant research
- Reference previous work
- Store important context

### @conversation System

The project supports cross-conversation context via the `@conversation` feature.

#### Recognizing References
When users include `@conversation:<id>` in their messages:
```
Pattern: @conversation[:\s]+([a-zA-Z0-9_-]+)
Examples:
  - @conversation:abc123
  - @conversation abc123
  - Based on @conversation:auth01, implement...
```

#### Loading Context
Load referenced conversation context:
```bash
# Get formatted context
namnam conv context <id>

# Or read directly from
.claude/conversations/<full-id>/context.md
```

#### Using Context
When conversation context is loaded:
1. Treat it as authoritative prior decisions
2. Build upon the context, don't contradict it
3. Reference specific points when relevant
4. Ask for clarification if context seems outdated

#### Saving Conversations
When a session contains important decisions, suggest saving:
```bash
namnam conv save -t "Title" -s "Brief summary"
```

#### Storage Location
```
.claude/conversations/
├── index.json           # Conversation index
└── conv_xxx_yyy/        # Individual conversation
    ├── meta.json        # Metadata
    ├── context.md       # Loadable context
    └── full.md          # Full log (optional)
```

---

## Error Handling

### Strategy
```
1. Understand the error message
2. Read relevant context
3. Identify the root cause
4. Plan a fix
5. Implement solution
6. Verify fix works
7. Don't give up immediately
8. Try alternative approaches
```

### Don't
- Guess at solutions without research
- Ignore error messages
- Skip verification
- Give up without trying alternatives
- Assume success without checking

---

## Quality Checklist

Before considering any task complete:
- [ ] Code follows existing patterns
- [ ] TypeScript types are correct
- [ ] Error handling is in place
- [ ] No security vulnerabilities
- [ ] Changes are minimal and focused
- [ ] Code runs without errors
- [ ] Related tests pass (if applicable)

---

**Generated by namnam-skills** | **Source**: [system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools)
