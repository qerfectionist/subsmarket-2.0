# /checkpoint:create - Git Stash Checkpoint

> Create a git stash checkpoint with optional description

## Usage

```
/checkpoint:create
/checkpoint:create "before refactoring auth"
/checkpoint:create WIP authentication changes
```

## Instructions

When the user invokes `/checkpoint:create`:

1. **Check for changes**:
   ```bash
   git status --porcelain
   ```

2. **If no changes**: Inform user there's nothing to checkpoint

3. **Create checkpoint**:
   ```bash
   # Stash all changes including untracked
   git stash push -u -m "checkpoint: [description] - [timestamp]"
   ```

4. **Confirm creation**:
   ```markdown
   ✅ Checkpoint created

   **Description**: [description or "auto-checkpoint"]
   **Time**: [timestamp]
   **Files**: [count] files saved

   Use `/checkpoint:list` to see all checkpoints
   Use `/checkpoint:restore` to restore this checkpoint
   ```

## Example

```
> /checkpoint:create before major refactor

✅ Checkpoint created

**Description**: before major refactor
**Time**: 2024-01-15 14:32:05
**Files**: 12 files saved

Use `/checkpoint:list` to see all checkpoints
```
