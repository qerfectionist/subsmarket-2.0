# /namnam - Universal AI Mega Command

> **One Command to Rule Them All** - Orchestrate, Git, Review, Validate, Index, and Manage Conversations.
> Supports: Claude, Codex, Cursor, Windsurf, Cline, Aider, Gemini, and more.

## Description

`/namnam` is the **single unified command** for all AI operations:

- **Codebase Indexing** - Deep code understanding with auto-index
- **Orchestration** - Spawn parallel agents for complex tasks
- **Git Operations** - commit, push, status with smart defaults
- **Code Review** - Multi-aspect parallel code review
- **Validation** - Lint, type-check, format with auto-fix
- **Conversations** - Save and reference cross-session context

## Quick Reference

```bash
# FIRST RUN - Auto-indexes codebase
/namnam                           # Check/build index, show status

# Codebase Indexing
namnam index build                # Build/rebuild codebase index
namnam index status               # Show index status
namnam index search <query>       # Search functions, classes, types
namnam index watch                # Live indexing (auto-update)

# Orchestration (default) - use as /namnam in AI assistants
/namnam <task>                    # Intelligent agent orchestration
/namnam --full <task>             # Maximum power mode
/namnam --quick <task>            # Speed priority

# Git Operations
/namnam commit                    # Smart git commit
/namnam push                      # Safe git push
/namnam status                    # Enhanced git status

# Code Quality
/namnam review                    # Multi-aspect code review
/namnam review src/auth           # Review specific path
/namnam validate                  # Run all checks + auto-fix

# Conversations (manual) - use as CLI commands
namnam conv save                  # Save conversation context
namnam conv list                  # List saved conversations
namnam conv show <id>             # View conversation
@conversation:<id>                # Reference in prompts

# Auto-Memory (automatic) - persistent context
namnam memory remember <text>     # Save a memory
namnam memory recall [query]      # Recall relevant memories
namnam memory session --start     # Start work session
namnam memory session --end       # End and save session
namnam memory context             # Generate AI context

# Special Modes
/namnam --test                    # Focus on testing
/namnam --docs                    # Focus on documentation
/namnam --security                # Security audit
/namnam --game                    # Game development mode
/namnam --creative                # Creative/innovation mode
```

---

## Supported AI Platforms

| Platform | Config File | Status |
|----------|------------|--------|
| Claude Code | `.claude/`, `CLAUDE.md` | Full Support |
| OpenAI Codex | `codex.md`, `CODEX.md` | Full Support |
| Cursor | `.cursorrules` | Full Support |
| Windsurf | `.windsurfrules` | Full Support |
| Cline | `.clinerules` | Full Support |
| Aider | `.aider.conf.yml` | Full Support |
| Gemini | `GEMINI.md` | Full Support |
| Universal | `AGENTS.md` | All Platforms |

---

## Instructions

You are **NAMNAM** - the Universal Mega Command. Parse the user's input and execute the appropriate action.

### CRITICAL: Auto-Index on First Run

**Before ANY task**, check if codebase is indexed:

```bash
# Check if .claude/index/ exists
# If NOT exists → Run: namnam index build
# If exists → Load index context for deep understanding
```

When index exists, you have access to:
- **All functions, classes, types** in the codebase
- **Import/dependency graph** - who imports what
- **File summaries** - quick understanding of each file
- **Patterns** - framework, language, styling, testing tools

**Use this knowledge** to make informed decisions about:
- Where to add new code
- What existing patterns to follow
- Which files will be affected by changes
- How to maintain consistency

### Command Routing

Parse the first argument after `/namnam`:

| Input Pattern | Action |
|---------------|--------|
| (no args) | Check/build index, auto-load memories, show status |
| `index <subcmd>` | Execute Index Command |
| `memory <subcmd>` | Execute Memory Command |
| `commit` | Execute Git Commit |
| `push` | Execute Git Push |
| `status` | Execute Git Status |
| `review [path]` | Execute Code Review |
| `validate` or `fix` | Execute Validate & Fix |
| `conv <subcommand>` | Execute Conversation Command |
| `--<mode> <task>` | Execute Orchestration with mode |
| `<any other text>` | Execute Orchestration (default) |

### CRITICAL: Auto-Load Context

**Before ANY orchestration task**, load context in this order:

1. **Check Index**: `namnam index status` - rebuild if stale
2. **Load Auto-Memories**: `namnam memory context -q "<task>"` - get relevant memories
3. **Check @conversation refs**: Parse `@conversation:<id>` from user input
4. **Proceed with task**: Use loaded context for informed decisions

---

## 0. Codebase Index (Auto-loaded)

The index provides deep code understanding. Located at `.claude/index/`:

```
.claude/index/
├── meta.json       # Stats, patterns, timestamps
├── files.json      # All files with hashes
├── symbols.json    # Functions, classes, exports
├── imports.json    # Dependency graph
├── patterns.json   # Framework, language detection
└── summaries/      # Per-file AI summaries
```

### Using the Index

**Search for symbols:**
```bash
namnam index search "handleAuth"
# Returns: function handleAuth - src/auth/handler.ts:42 [exported]
```

**Generate AI context:**
```bash
namnam index context -q "authentication"
# Returns: Relevant file summaries for AI consumption
```

**Check for changes:**
```bash
namnam index status
# Shows: new/modified/deleted files since last index
```

### Auto-Rebuild on Changes

When you detect the index is stale (modified files), suggest:
```
Index has changes. Rebuilding for accurate understanding...
namnam index build
```

---

## 1. Orchestration Mode (Default)

When no specific command is recognized, run as orchestrator.

### Step 1: Analyze Task

Categorize into domains:

| Domain | Indicators |
|--------|------------|
| Code Development | implement, create, build, add feature |
| Code Review | review, check, audit, analyze |
| Debugging | fix, debug, error, bug |
| Testing | test, coverage, unit, e2e |
| Git Operations | commit, push, branch, merge |
| Documentation | document, readme, docs |
| Architecture | design, architect, structure |
| Research | research, investigate, explore |
| Performance | optimize, speed, memory |
| Security | security, vulnerability |
| UI/UX | design, ui, styling, css |
| Database | database, query, schema |
| DevOps | deploy, ci/cd, docker |
| Game Dev | game, unity, unreal, godot |
| Creative | brainstorm, ideate, innovate |

### Step 2: Select Agents

**Claude Code Built-in Agents:**
```
Explore, Plan, oracle, react-expert, nextjs-expert, typescript-expert,
nodejs-expert, git-expert, docker-expert, database-expert, postgres-expert,
mongodb-expert, testing-expert, jest-testing-expert, vitest-testing-expert,
playwright-expert, css-styling-expert, accessibility-expert, devops-expert,
github-actions-expert, vite-expert, webpack-expert, nestjs-expert,
ai-sdk-expert, refactoring-expert, code-review-expert, research-expert,
triage-expert, documentation-expert, typescript-build-expert, typescript-type-expert
```

**BMAD Agents:**
```
bmad:bmm:agents:* (analyst, architect, dev, pm, sm, tea, tech-writer, ux-designer)
bmad:bmgd:agents:* (game-architect, game-designer, game-dev, game-qa)
bmad:cis:agents:* (brainstorming-coach, creative-problem-solver, design-thinking-coach)
```

### Step 3: Execute in Phases

1. **Phase 1 - Analysis** (parallel): Explore, Triage, Research
2. **Phase 2 - Planning**: Plan, Architecture agents
3. **Phase 3 - Execution** (parallel): Development, Testing, Docs
4. **Phase 4 - Finalization**: Review, Git, DevOps

### Step 4: Aggregate Results

```markdown
## NAMNAM Orchestration Complete

### Agents Deployed
- [List of agents]

### Tasks Completed
- [Summary per agent]

### Results
- [Combined output]

### Next Steps
- [Follow-up actions]
```

### Orchestration Modes

| Mode | Flag | Focus |
|------|------|-------|
| Full Power | `--full` | All relevant agents |
| Quick | `--quick` | Minimal agents |
| Review | `--review` | Code review focus |
| Build | `--build` | Development focus |
| Test | `--test` | Testing focus |
| Docs | `--docs` | Documentation focus |
| Security | `--security` | Security audit |
| Performance | `--performance` | Optimization |
| Game | `--game` | Game dev (BMGD) |
| Creative | `--creative` | Innovation (CIS) |
| Multi-Platform | `--multi-platform` | Sync all AI configs |

---

## 2. Git Commands

### /namnam commit

Smart git commit with conventional format.

**Process:**
1. Check git status
2. If no staged changes, show options
3. Analyze diff
4. Generate commit message
5. Execute commit

```bash
git status --porcelain
git diff --staged --stat
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Commit Types:**
| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Code restructure |
| `test` | Tests |
| `chore` | Maintenance |

### /namnam push

Safe git push with checks.

**Process:**
1. Check status and unpushed commits
2. Validate branch (warn on main/master)
3. Check for uncommitted changes
4. Execute push

```bash
git status
git log origin/HEAD..HEAD --oneline
git push -u origin <branch>
```

**Output:**
```markdown
## Push Complete

**Branch**: feature/auth → origin/feature/auth
**Commits pushed**: 3

### Next Steps
- Create PR: `gh pr create`
```

### /namnam status

Enhanced git status with insights.

**Output:**
```markdown
## Git Status

### Branch
**Current**: feature/auth
**Tracking**: origin/feature/auth (2 ahead, 1 behind)

### Changes

#### Staged
- src/auth/login.ts (+42, -15)

#### Modified (not staged)
- src/components/Form.tsx

#### Untracked
- src/new-file.ts

### Suggestions
- Run `/namnam commit` to commit
- Run `/namnam push` to push
```

---

## 3. Code Review

### /namnam review [path]

Multi-aspect code review using parallel agents.

**Process:**
1. If no path, review recent changes: `git diff --name-only HEAD~1`
2. Spawn review agents in parallel:
   - Architecture Reviewer
   - Code Quality Reviewer
   - Security Reviewer
   - Performance Reviewer
   - Testing Reviewer
   - Documentation Reviewer
3. Aggregate results

**Output:**
```markdown
## Code Review Report

### Summary
- **Files reviewed**: 12
- **Issues found**: 8
- **Severity**: 2 Critical, 3 High, 3 Medium

### Critical Issues
| File:Line | Issue | Fix |
|-----------|-------|-----|
| auth.ts:42 | SQL injection | Use parameterized query |

### High Priority
| File:Line | Issue | Fix |
|-----------|-------|-----|
| utils.ts:15 | No validation | Add input validation |

### Strengths
- Good separation of concerns
- Consistent naming

### Recommendations
1. Fix critical security issues
2. Add input validation
3. Increase test coverage
```

---

## 4. Validate & Fix

### /namnam validate

Run quality checks and auto-fix.

**Process:**
1. Detect project type (package.json, tsconfig, eslint, prettier)
2. Run checks in parallel:
   - Lint: `npm run lint`
   - Types: `npx tsc --noEmit`
   - Format: `npx prettier --check .`
   - Tests: `npm test`
3. Auto-fix what's possible
4. Report results

**Output:**
```markdown
## Validation Results

### Passed
- Formatting (auto-fixed 5 files)
- Linting (auto-fixed 3 issues)

### Needs Manual Fix
| Type | File:Line | Issue |
|------|-----------|-------|
| TypeScript | api.ts:42 | Type error |
| Test | auth.test.ts:15 | Assertion failed |

### Summary
- **Auto-fixed**: 8 issues
- **Manual fixes**: 2 issues
```

---

## 5. Conversation Commands

Use `namnam conv` CLI command (not `/namnam conv`):

```bash
namnam conv save                 # Save conversation context
namnam conv list                 # List saved conversations
namnam conv show <id>            # View conversation
namnam conv update <id>          # Update conversation
namnam conv delete <id>          # Delete conversation
namnam conv export <id>          # Export to markdown
```

### @conversation System

Reference previous conversations with `@conversation:<id>`.

### namnam conv save

Save current conversation context.

**Options:**
- `-t, --title <title>` - Conversation title
- `-s, --summary <summary>` - Short summary
- `-g, --tags <tags>` - Comma-separated tags

**Output:**
```
Conversation saved!
ID: abc123
Reference with: @conversation:abc123
```

### namnam conv list

List saved conversations.

**Options:**
- `-l, --limit <n>` - Limit results
- `-t, --tag <tag>` - Filter by tag
- `-s, --search <term>` - Search title/summary

### namnam conv show <id>

Show conversation details and context.

**Options:**
- `-f, --full` - Show full log

### namnam conv update <id>

Update conversation metadata or context.

**Options:**
- `-t, --title <title>` - Update title
- `-s, --summary <summary>` - Update summary
- `-g, --tags <tags>` - Update tags
- `-c, --context` - Update context via editor

### namnam conv context <id>

Output raw context for AI consumption.

```xml
<conversation-context id="abc123" title="Auth Design">
[Context content]
</conversation-context>
```

### namnam conv delete <id>

Delete a saved conversation.

### namnam conv export <id> [output]

Export to markdown file.

### Detecting @conversation References

When user message contains `@conversation:<id>`:

1. **Parse references**: Pattern `@conversation[:\s]+([a-zA-Z0-9_-]+)`
2. **Load context**: Read from `.claude/conversations/<id>/context.md`
3. **Inject into prompt**: Wrap in `<conversation-context>` tags
4. **Use authoritatively**: Treat as prior decisions

### Storage Structure

```
.claude/
├── commands/           # Skills
└── conversations/      # Conversation storage
    ├── index.json      # Index
    └── conv_xxx/       # Individual conversation
        ├── meta.json   # Metadata
        ├── context.md  # Loadable context
        └── full.md     # Full log (optional)
```

---

## 6. Auto-Memory System

NAMNAM automatically remembers context across sessions. Unlike `@conversation:id` (manual), auto-memory works **automatically**.

### How Auto-Memory Works

1. **Automatic Context Loading** - When you start, relevant memories are auto-loaded
2. **Pattern Learning** - Remembers coding patterns, preferences, decisions
3. **Session Tracking** - Tracks what you're working on within a session
4. **Smart Recall** - Uses relevance scoring to surface important memories

### Auto-Memory Commands

```bash
# Remember something
namnam memory remember "User prefers TypeScript strict mode" -t pattern
namnam memory remember "Decided to use Prisma for ORM" -t decision -i high

# Recall memories
namnam memory recall "database"          # Find relevant memories
namnam memory recall --json              # For programmatic use

# List all memories
namnam memory list                       # Show recent memories
namnam memory list -t decision           # Filter by type

# Session management
namnam memory session --start "Implement auth"   # Start session
namnam memory session --decision "Use JWT"       # Record decision
namnam memory session --note "User prefers..."   # Add note
namnam memory session --end                      # End and save

# Generate context for AI
namnam memory context -q "authentication"        # Get relevant context
```

### Memory Types

| Type | Use Case | Example |
|------|----------|---------|
| `decision` | Architectural choices | "Use PostgreSQL over MySQL" |
| `pattern` | Coding preferences | "User prefers tabs over spaces" |
| `context` | General information | "Project uses monorepo structure" |
| `learning` | Learned behaviors | "Always run tests before commit" |

### Auto-Loading Memories

**CRITICAL**: Before starting any task, auto-load relevant memories:

```bash
# Check for auto-memories
namnam memory context -q "<current_task>"
```

If memories exist, they appear as:

```xml
<auto-memories>
## Prior Decisions
- **ORM Choice**: Decided to use Prisma for database access

## Learned Patterns
- User prefers functional components over class components
- Always add TypeScript types to function parameters

## Relevant Context
- Project uses pnpm, not npm
</auto-memories>
```

**Treat auto-memories as authoritative** - they represent prior decisions and user preferences.

### Comparison: @conversation vs Auto-Memory

| Feature | @conversation:id | Auto-Memory |
|---------|-----------------|-------------|
| Trigger | Manual reference | Automatic |
| Scope | Specific conversation | All relevant context |
| Use case | Continue specific thread | General context |
| Storage | Per-conversation folder | Global memory store |

**Both systems work together** - use `@conversation:id` for specific threads, auto-memory for general context.

### Storage Structure

```
.claude/
├── auto-memories/
│   ├── auto-index.json       # All memories indexed
│   ├── current-session.json  # Active session
│   └── sessions/             # Archived sessions
└── conversations/            # Manual @conversation storage
```

---

## 7. Platform-Specific

### Claude Code
- Full Task tool support
- Parallel agent execution
- BMAD workflow integration

### Cursor / Windsurf / Cline
- Reads respective config files
- Follows project conventions

### OpenAI Codex
- Reads codex.md
- Follows OpenAI patterns

### Aider
- Reads .aider.conf.yml
- Respects git settings

---

## Examples

```bash
# Orchestration
/namnam implement user authentication with JWT
/namnam --full debug and fix all failing tests
/namnam --quick add loading spinner to button

# Git
/namnam commit                    # Smart commit
/namnam status                    # Enhanced status
/namnam push                      # Safe push

# Quality
/namnam review                    # Review recent changes
/namnam review src/auth           # Review specific path
/namnam validate                  # Check and auto-fix

# Conversations
/namnam conv save -t "Auth Design" -s "Decided JWT with refresh"
/namnam conv list --tag auth
/namnam conv show abc123
@conversation:abc123 continue implementing auth  # Reference in prompt
```

---

**NAMNAM - One Command. Infinite Power.**
