# Hookify

Build custom hooks to prevent unwanted behavior and enforce coding standards.

## Commands

### /hookify
Create a new hook interactively.

### /hookify:list
List all configured hooks.

### /hookify:configure
Edit hook configurations.

### /hookify:help
Show hook documentation.

## Usage

```
/hookify create pre-commit linting check
/hookify:list
/hookify:configure my-hook
```

## Hook Types

1. **PreToolUse** - Run before tool execution
2. **PostToolUse** - Run after tool execution
3. **SessionStart** - Run when session begins
4. **SessionEnd** - Run when session ends
5. **Stop** - Intercept exit attempts

## Example Hook

```yaml
name: no-console-log
trigger: PreToolUse
pattern: "console.log"
action: warn
message: "Consider using a proper logger instead of console.log"
```

## Features

- **conversation-analyzer** agent for pattern detection
- **writing-rules** skill for rule syntax
- Custom action handlers
- Pattern matching with regex support

$ARGUMENTS
