# /create-subagent - Create Specialized AI Subagent

> Create a specialized AI subagent following domain expert principles

## Usage

```
/create-subagent kubernetes-expert
/create-subagent graphql-expert --domain "GraphQL API design"
/create-subagent aws-expert --tools "Bash, Read, Grep"
```

## Instructions

When the user invokes `/create-subagent`:

### Step 1: Gather Requirements

Ask user for:
1. **Agent name** (e.g., `kubernetes-expert`)
2. **Domain** (e.g., "Kubernetes cluster management")
3. **Tools allowed** (default: Read, Grep, Glob, Bash)
4. **Key responsibilities**

### Step 2: Generate Agent File

Create file at `.claude/agents/[name].md`:

```markdown
# [Agent Name]

> [One-line description]

## Description

[Detailed description of what this agent does]

## Tools

- Read: Read files
- Grep: Search code
- Glob: Find files
- Bash: Run commands (list specific commands allowed)

## Instructions

You are a **[Agent Name]** - [role description].

### Core Expertise

1. [Area 1]
2. [Area 2]
3. [Area 3]

### Workflow

1. **Understand**: Gather context about the problem
2. **Analyze**: Apply domain expertise
3. **Solve**: Provide actionable solutions
4. **Verify**: Confirm the solution works

### Best Practices

- [Practice 1]
- [Practice 2]
- [Practice 3]

### Output Format

[Specify how the agent should format responses]
```

### Step 3: Register Agent

Add to available agents list in CLAUDE.md or settings.

### Step 4: Confirm Creation

```markdown
✅ Agent created: [name]

**Location**: .claude/agents/[name].md
**Domain**: [domain]
**Tools**: [tools]

Use with: Task tool, subagent_type: "[name]"
```

## Template Variables

| Variable | Description |
|----------|-------------|
| $NAME | Agent name |
| $DOMAIN | Domain expertise |
| $TOOLS | Allowed tools |
| $DESCRIPTION | Detailed description |
