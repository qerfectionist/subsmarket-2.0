# /commit - Smart Git Commit

Create git commits with intelligent message generation.

## Usage

```
/commit
/commit fix login validation bug
```

## Instructions

When the user invokes `/commit`:

1. **Check git status**:
   ```bash
   git status
   git diff --staged
   ```

2. **If no staged changes**:
   - Show untracked/modified files
   - Ask what to stage or stage all

3. **Analyze changes**:
   - Parse diff to understand what changed
   - Identify the type: feat, fix, refactor, docs, test, chore

4. **Generate commit message**:
   - Follow conventional commits format
   - Include scope if identifiable
   - Keep subject under 50 chars
   - Add body for complex changes

5. **Format**:
   ```
   <type>(<scope>): <subject>

   <body>

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

6. **Execute commit**:
   ```bash
   git commit -m "message"
   ```

## Examples

```
feat(auth): add password reset functionality

- Add forgot password form
- Implement email sending
- Add reset token validation

Co-Authored-By: Claude <noreply@anthropic.com>
```
