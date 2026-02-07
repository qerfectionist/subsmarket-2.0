# /checkpoint:list - List All Checkpoints

> List all Claude Code checkpoints with time and description

## Usage

```
/checkpoint:list
/checkpoint:list --all
```

## Instructions

When the user invokes `/checkpoint:list`:

1. **Get stash list**:
   ```bash
   git stash list
   ```

2. **Filter Claude checkpoints**:
   Look for stashes with "checkpoint:" prefix

3. **Format output**:
   ```markdown
   ## Checkpoints

   | # | Description | Time | Files |
   |---|-------------|------|-------|
   | 0 | before refactor | 2h ago | 12 |
   | 1 | WIP auth changes | 1d ago | 5 |
   | 2 | auto-checkpoint | 2d ago | 3 |

   Use `/checkpoint:restore [n]` to restore a checkpoint
   ```

4. **If no checkpoints**:
   ```
   No checkpoints found. Use `/checkpoint:create` to create one.
   ```
