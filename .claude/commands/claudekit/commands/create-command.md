# /create-command - Create Slash Command

> Create a new Claude Code slash command with full feature support

## Usage

```
/create-command deploy
/create-command test-all --description "Run all tests"
/create-command lint-fix --args "files"
```

## Instructions

When the user invokes `/create-command`:

### Step 1: Gather Requirements

Ask user for:
1. **Command name** (e.g., `deploy`, `test-all`)
2. **Description** (what the command does)
3. **Arguments** (optional: what $ARGUMENTS represents)
4. **Steps** (what the command should do)

### Step 2: Generate Command File

Create file at `.claude/commands/[name].md`:

```markdown
# /[name] - [Title]

> [Description]

## Usage

\`\`\`
/[name]
/[name] [example args]
\`\`\`

## Arguments

- `$ARGUMENTS`: [What arguments represent]

## Instructions

When the user invokes `/[name]`:

[Detailed instructions for what Claude should do]

### Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Output

[What should be returned/displayed]
```

### Step 3: Confirm Creation

```markdown
✅ Command created: /[name]

**Location**: .claude/commands/[name].md
**Description**: [description]

You can now use: /[name] [args]
```

## Examples

### Simple Command
```
/create-command format

Creates:
# /format - Format Code

## Instructions
Run prettier on all files:
\`\`\`bash
npx prettier --write .
\`\`\`
```

### Command with Args
```
/create-command test-file --args "filepath"

Creates:
# /test-file - Run Tests for File

## Usage
/test-file src/utils.ts

## Arguments
- `$ARGUMENTS`: The file path to test

## Instructions
Run tests for the specified file:
\`\`\`bash
npm test -- $ARGUMENTS
\`\`\`
```
