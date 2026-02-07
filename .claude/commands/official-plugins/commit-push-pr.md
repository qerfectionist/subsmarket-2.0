# /commit-push-pr - Full Git Workflow

Complete workflow: commit, push, and create pull request.

## Usage

```
/commit-push-pr
/commit-push-pr "Add user authentication feature"
```

## Instructions

When the user invokes `/commit-push-pr`:

### Step 1: Commit
1. Check git status and staged changes
2. Generate or use provided commit message
3. Execute commit

### Step 2: Push
1. Check current branch
2. Verify remote tracking
3. Push to remote:
   ```bash
   git push -u origin <branch>
   ```

### Step 3: Create PR
1. Use GitHub CLI to create PR:
   ```bash
   gh pr create --title "PR title" --body "PR description"
   ```

2. PR body format:
   ```markdown
   ## Summary
   - Brief description of changes

   ## Changes
   - List of specific changes

   ## Test Plan
   - How to test the changes

   🤖 Generated with Claude Code
   ```

3. Return PR URL to user

## Requirements

- Git repository initialized
- GitHub CLI (`gh`) installed and authenticated
- Remote repository configured
