# /checkpoint:restore - Restore Checkpoint

> Restore project to a previous checkpoint

## Usage

```
/checkpoint:restore
/checkpoint:restore 0
/checkpoint:restore 2
```

## Instructions

When the user invokes `/checkpoint:restore`:

1. **If no index provided**: Show list and ask which to restore

2. **Confirm before restore**:
   ```
   ⚠️ This will restore checkpoint #[n]: "[description]"
   Current changes will be saved as a new checkpoint first.
   Continue? (y/n)
   ```

3. **Save current state first**:
   ```bash
   git stash push -u -m "checkpoint: auto-save before restore - [timestamp]"
   ```

4. **Restore the checkpoint**:
   ```bash
   git stash apply stash@{n}
   ```

5. **Confirm restoration**:
   ```markdown
   ✅ Checkpoint restored

   **Restored**: [description]
   **Your previous changes**: Saved as checkpoint #0

   If you need to undo, use `/checkpoint:restore 0`
   ```

## Safety

- Always saves current state before restoring
- Uses `apply` not `pop` to preserve checkpoint
- User can always get back to previous state
