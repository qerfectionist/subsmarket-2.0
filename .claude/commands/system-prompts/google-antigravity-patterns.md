# Google Antigravity Patterns

> Best practices extracted from Google DeepMind's Antigravity AI Coding Assistant

## Identity

Antigravity is created by the **Google DeepMind team** working on Advanced Agentic Coding.

---

## Key Innovations

### 1. Workflow System

```markdown
# Custom Workflows

## Location
.agent/workflows/*.md

## Format
---
description: [short title]
---
[specific steps]

## Turbo Annotations
- `// turbo` above a step: Auto-run that step
- `// turbo-all` anywhere: Auto-run ALL steps

## Example
\`\`\`
1. Install dependencies
// turbo
2. Run build
// turbo
3. Start dev server
\`\`\`
Steps 2 and 3 auto-run (SafeToAutoRun: true)
```

### 2. Knowledge Item (KI) System

```markdown
# Knowledge Discovery

## MANDATORY First Step
Check KI summaries before ANY research

## Process
1. Review KI summaries provided at conversation start
2. Identify relevant KIs by title/summary
3. Read relevant KI artifacts BEFORE independent research
4. Build upon KI information

## KI Structure
C:\Users\...\.gemini\<project>\knowledge\
├── metadata.json (summary, timestamps, references)
└── artifacts/ (documentation, implementation details)
```

### 3. Persistent Context

```markdown
# Cross-Conversation Memory

## Two Mechanisms
1. Conversation Logs and Artifacts
   - Raw conversation history
   - ASSISTANT-generated artifacts

2. Knowledge Items (KIs)
   - Distilled knowledge
   - Updated by KNOWLEDGE SUBAGENT

## When to Use Conversation Logs
- Small number of relevant conversations
- Need conversation details
- @mention with Conversation ID
- User references specific conversation

## When to Use KIs
- Starting any kind of research
- Topic appears relevant
- Referenced by conversation or another KI
```

### 4. Web Application Development

```markdown
# Technology Stack

## Core Rules
- HTML for structure, JavaScript for logic
- Vanilla CSS preferred (not Tailwind unless requested)
- Next.js or Vite for complex web apps

## New Project Creation
- Use `npx -y` for automatic install
- Run `--help` first to see options
- Initialize in current directory: `./`
- Non-interactive mode always

## Design Aesthetics (CRITICAL)
- USER MUST BE WOWED
- Vibrant colors, dark modes, glassmorphism
- Dynamic animations
- Modern typography (Google Fonts)
- Smooth gradients
- Micro-animations

FAILURE TO IMPRESS = FAILURE!
```

### 5. Tool Execution Model

```markdown
# Parallel Tool Execution

## waitForPreviousTools Parameter
- false (default): Execute immediately (parallel)
- true: Wait for previous tools to complete (sequential)

## Example
{
  "tool": "codebase_search",
  "Query": "auth flow",
  "waitForPreviousTools": false  // Run in parallel
}

{
  "tool": "view_file",
  "AbsolutePath": "/path/to/auth.ts",
  "waitForPreviousTools": true  // Wait for search first
}
```

---

## Implementation Examples

### Workflow File

```markdown
---
description: How to deploy the application
---

1. Run tests to ensure everything passes
   \`npm test\`

2. Build the production bundle
// turbo
   \`npm run build\`

3. Deploy to production
// turbo
   \`npm run deploy\`
```

### KI Usage Pattern

```javascript
// Before ANY research, check KIs first

async function handleUserRequest(request) {
  // Step 1: Check KI summaries (MANDATORY)
  const relevantKIs = await findRelevantKIs(request);

  if (relevantKIs.length > 0) {
    // Step 2: Read relevant KI artifacts
    const kiContent = await Promise.all(
      relevantKIs.map(ki => readKIArtifacts(ki.path))
    );

    // Step 3: Build upon existing knowledge
    return buildOnExistingKnowledge(kiContent, request);
  }

  // Only do fresh research if no relevant KIs
  return performFreshResearch(request);
}
```

### Browser Subagent

```javascript
// Launch browser subagent for web interactions

const browserTask = {
  RecordingName: "login_flow_demo",
  TaskName: "Navigating to Login Page",
  Task: `
    1. Navigate to http://localhost:3000/login
    2. Fill in email field with "test@example.com"
    3. Fill in password field with "password123"
    4. Click the Login button
    5. Wait for redirect to dashboard
    6. Take screenshot to verify
  `
};
```

---

## Best Practices Summary

| Area | Antigravity Approach |
|------|---------------------|
| Workflows | Custom .md files with turbo annotations |
| Knowledge | KI system with artifacts |
| Context | Persistent across conversations |
| Web Dev | Premium aesthetics required |
| Tools | Parallel by default, sequential when needed |
| Paths | Absolute paths only |

---

## Unique Features

### 1. Image Generation
```markdown
- Built-in generate_image tool
- Create UI mockups
- Generate assets for apps
- Iterate on designs with user
- No placeholders - real images
```

### 2. Browser Recording
```markdown
- Automatic WebP video recording
- All browser interactions recorded
- Save as artifacts
- Review flows visually
```

### 3. Token Budget
```markdown
- Explicit token budget management
- Budget tag in system prompt
- Optimize context usage
```

---

## Applying to Your Projects

1. **Create Workflows**:
```markdown
# .agent/workflows/deploy.md
---
description: Deploy to production
---
// turbo-all
1. Run tests
2. Build bundle
3. Deploy
```

2. **In AGENTS.md**:
```markdown
## Knowledge Discovery
- Check existing documentation first
- Build on prior analysis
- Store important context

## Web Development
- Premium aesthetics required
- Modern design patterns
- Micro-animations essential
```

**Source**: Google Antigravity Fast Prompt & Planning Mode
