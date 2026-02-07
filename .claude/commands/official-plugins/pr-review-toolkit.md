# /pr-review-toolkit:review-pr - Comprehensive PR Review

Multi-faceted PR review with specialized analysis agents.

## Usage

```
/pr-review-toolkit:review-pr 123
/pr-review-toolkit:review-pr 123 --comments
/pr-review-toolkit:review-pr 123 --tests
/pr-review-toolkit:review-pr 123 --all
```

## Options

| Option | Agent | Focus |
|--------|-------|-------|
| `--comments` | `comment-analyzer` | Review code comments quality |
| `--tests` | `pr-test-analyzer` | Analyze test coverage and quality |
| `--errors` | `silent-failure-hunter` | Find silent failures and error handling gaps |
| `--types` | `type-design-analyzer` | TypeScript/type safety analysis |
| `--code` | `code-reviewer` | General code quality review |
| `--simplify` | `code-simplifier` | Find simplification opportunities |
| `--all` | All agents | Comprehensive review |

## Instructions

When the user invokes `/pr-review-toolkit:review-pr`:

1. **Fetch PR details**:
   ```bash
   gh pr view <number> --json files,additions,deletions,body
   gh pr diff <number>
   ```

2. **Run selected agents in parallel**:
   - Each agent analyzes their specific focus area
   - Agents return findings with severity levels

3. **Aggregate results**:
   ```markdown
   ## PR Review: #123

   ### 🔴 Critical Issues
   - [List critical findings]

   ### 🟡 Warnings
   - [List warnings]

   ### 🟢 Suggestions
   - [List suggestions]

   ### Summary
   - Files reviewed: X
   - Issues found: Y
   - Recommendation: APPROVE / REQUEST_CHANGES
   ```

## Agents

| Agent | Purpose |
|-------|---------|
| `comment-analyzer` | Comment quality and documentation |
| `pr-test-analyzer` | Test coverage and quality |
| `silent-failure-hunter` | Error handling gaps |
| `type-design-analyzer` | Type safety analysis |
| `code-reviewer` | General code quality |
| `code-simplifier` | Complexity reduction |
