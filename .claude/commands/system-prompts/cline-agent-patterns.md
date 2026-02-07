# Cline Agent Patterns

> Best practices extracted from Cline - Highly skilled software engineer VSCode extension

## Core Philosophy

Cline uses a **step-by-step tool execution model**:
- One tool per message
- Wait for results before proceeding
- User approval for actions
- Iterative problem-solving

---

## Key Patterns

### 1. Tool Use Sequence

```markdown
# Step-by-Step Execution

## Process
1. Analyze what information you have
2. Choose most appropriate tool
3. Use ONE tool per message
4. Wait for user response
5. Proceed based on result

## Why This Matters
- Confirm success before proceeding
- Address issues immediately
- Adapt based on new information
- Each action builds on previous
```

### 2. File Editing Strategy

```markdown
# Write vs Replace

## write_to_file
When to use:
- Creating new files
- Overwriting large boilerplate
- Extensive changes make replace unwieldy
- Complete restructuring needed

## replace_in_file
When to use (DEFAULT):
- Small, localized changes
- Updating specific portions
- Long files, minimal changes

## SEARCH/REPLACE Format
<<<<<<< SEARCH
[exact content to find]
=======
[new content to replace with]
>>>>>>> REPLACE

## Critical Rules
- Match EXACTLY including whitespace
- Include enough context for uniqueness
- List blocks in file order
- Keep blocks concise
```

### 3. Plan vs Act Modes

```markdown
# Dual Mode System

## PLAN MODE
- Gather information
- Clarify requirements
- Create detailed plans
- Ask clarifying questions
- Brainstorm with user
- Use mermaid diagrams

## ACT MODE
- Execute tasks
- Use all tools
- Complete user requests
- Present results

## Flow
PLAN MODE -> User approves plan -> Switch to ACT MODE
```

### 4. MCP Server Integration

```markdown
# Model Context Protocol

## Using MCP Tools
<use_mcp_tool>
<server_name>weather-server</server_name>
<tool_name>get_forecast</tool_name>
<arguments>
{
  "city": "San Francisco",
  "days": 5
}
</arguments>
</use_mcp_tool>

## Using MCP Resources
<access_mcp_resource>
<server_name>data-server</server_name>
<uri>resource://data/users</uri>
</access_mcp_resource>

## Key Rules
- One MCP operation at a time
- Wait for confirmation
- Proceed only after success
```

### 5. Task Handoff

```markdown
# Creating New Tasks

## When to Handoff
- Current task complete
- Context switch needed
- User may want fresh start

## Handoff Content
- What was accomplished
- Specific file names
- Next steps and focus
- Critical information
- Relation to overall workflow

## Like a Handoff File
"Enough for a totally new developer to pick up
where you left off and know exactly what to do"
```

---

## Implementation Examples

### SEARCH/REPLACE Pattern

```javascript
// Example: Proper SEARCH/REPLACE block

/*
<<<<<<< SEARCH
import React from 'react';
=======
import React, { useState } from 'react';
>>>>>>> REPLACE

<<<<<<< SEARCH
function handleSubmit() {
  saveData();
  setLoading(false);
}
=======
>>>>>>> REPLACE
(This deletes the function - empty REPLACE)

<<<<<<< SEARCH
return (
  <div>
=======
function handleSubmit() {
  saveData();
  setLoading(false);
}

return (
  <div>
>>>>>>> REPLACE
(This moves the function)
*/
```

### Plan Mode Response

```javascript
// Example: Plan mode interaction

const planModeResponse = {
  understanding: `
    Based on your request to add authentication,
    I need to clarify a few things:
    - What auth method? (OAuth, JWT, Session)
    - Which providers? (Google, GitHub, Email)
    - Need password reset flow?
  `,

  proposedPlan: `
    ## Authentication Implementation Plan

    ### Phase 1: Setup
    - Install auth dependencies
    - Create auth context

    ### Phase 2: Backend
    - User model
    - Auth endpoints

    ### Phase 3: Frontend
    - Login/register forms
    - Protected routes

    ### Mermaid Diagram
    \`\`\`mermaid
    flowchart LR
      A[User] --> B[Login Form]
      B --> C{Auth API}
      C --> D[JWT Token]
      D --> E[Protected Routes]
    \`\`\`
  `,

  nextStep: "Shall I proceed with this plan?"
};
```

---

## Best Practices Summary

| Area | Cline Approach |
|------|----------------|
| Tools | One at a time, wait for result |
| Editing | SEARCH/REPLACE default, exact match |
| Modes | PLAN for design, ACT for execution |
| MCP | Sequential operations |
| Handoff | Comprehensive context transfer |
| Communication | Direct, never filler phrases |

---

## Forbidden Phrases

```markdown
# Never Start With
- "Great"
- "Certainly"
- "Okay"
- "Sure"

# Be Direct Instead
Bad: "Great, I've updated the CSS"
Good: "I've updated the CSS"

Bad: "Sure, let me help with that"
Good: "Searching for the auth module..."
```

---

## Applying to Your Projects

1. **Add to .clinerules**:
```yaml
# Tool Usage
tool_strategy: one_at_a_time
wait_for_confirmation: true
default_edit_tool: replace_in_file

# Communication
forbidden_phrases:
  - Great
  - Certainly
  - Okay
  - Sure
```

2. **In AGENTS.md**:
```markdown
## Editing Strategy
- Use SEARCH/REPLACE for targeted changes
- Match content exactly including whitespace
- Include context for uniqueness
- List changes in file order
```

**Source**: Cline System Prompt (formerly Claude Dev)
