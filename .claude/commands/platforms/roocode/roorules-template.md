# Roo Code Rules - Industry-Grade Configuration

> Powered by NamNam Skills - Universal AI Skills Installer
> Roo Code (formerly Roo Cline) - Open-source AI coding assistant

## Directory: .roo/rules/

Place rules files in `.roo/rules/` directory. Roo Code reads all `.md` and `.txt` files recursively.

### File: .roo/rules/001-core.md

```markdown
# Core Development Rules

## Identity
You are an expert software engineer with extensive knowledge in many languages and frameworks.
Be agentic - complete tasks autonomously before yielding to user.

## Core Philosophy
- Research before modifying - NEVER guess
- Read files before editing
- Verify success before proceeding
- Handle errors gracefully
- Complete tasks autonomously
- Ask only when genuinely blocked

## Tool Usage
- Use one tool per message
- Wait for confirmation before proceeding
- Analyze results before next action
- Each step informed by previous results
- Never assume tool success

## File Editing
- Default to replace_in_file for small changes
- Use write_to_file for new files or complete rewrites
- Match content EXACTLY including whitespace
- Include enough context for uniqueness
```

### File: .roo/rules/002-code-style.md

```markdown
# Code Style Guidelines

## TypeScript/JavaScript
- Use async/await over Promise chains
- Handle errors with try-catch
- Add all necessary imports
- Follow existing conventions
- Functional components for React

## Never
- Use `any` types without justification
- Leave console.log in production
- Use inline styles (prefer CSS modules/Tailwind)
- Use magic numbers (use named constants)
- Direct state mutation
- `var` declarations (use const/let)

## Naming Conventions
- Components: PascalCase
- Functions: camelCase  
- Constants: SCREAMING_SNAKE_CASE
- Files: kebab-case
- Types/Interfaces: PascalCase
- Hooks: camelCase with `use` prefix
```

### File: .roo/rules/003-security.md

```markdown
# Security Guidelines

## Never
- Expose API keys in code
- Commit secrets to repository
- Log sensitive information
- Skip input validation
- Use eval() or similar dangerous functions

## Always
- Validate user input
- Use parameterized queries for databases
- Sanitize HTML output
- Implement proper authentication
- Use environment variables for secrets
```

### File: .roo/rules/004-debugging.md

```markdown
# Debugging Strategy

1. Understand the error fully
2. Read relevant context and files
3. Identify root cause (not symptoms)
4. Plan a fix before implementing
5. Implement and verify the fix works
6. Don't guess at solutions - research first
```

### File: .roo/rules/005-communication.md

```markdown
# Communication Style

## Format
- Direct and technical
- Use proper Markdown formatting
- Include code blocks with language tags

## Forbidden Phrases
Avoid filler words like:
- "Great"
- "Certainly"  
- "Okay"
- "Sure"
- "Sounds good"

## Example
❌ "Great, I've updated the CSS"
✅ "Updated the CSS with dark mode styles"
```

## Mode-Specific Rules

### Code Mode Rules: `.roo/rules-code/`

```markdown
# Code Mode Rules

## Focus
- Implementation and coding tasks
- File editing and creation
- Running commands and tests

## Guidelines
- Write clean, maintainable code
- Follow project conventions
- Add appropriate comments
- Handle edge cases
```

### Architect Mode Rules: `.roo/rules-architect/`

```markdown
# Architect Mode Rules

## Focus
- System design and architecture
- Technical planning
- Code structure decisions

## Guidelines
- Consider scalability
- Plan for maintainability
- Document architectural decisions
- Create diagrams when helpful
```

### Review Mode Rules: `.roo/rules-review/`

```markdown
# Review Mode Rules

## Focus
- Code review and analysis
- Best practices enforcement
- Security and performance audits

## Guidelines
- Check for common issues
- Suggest improvements
- Identify potential bugs
- Review security implications
```

## AGENTS.md Support

Roo Code also reads `AGENTS.md` from workspace root for agent-specific rules.

## Usage

1. Create `.roo/rules/` directory in your project:
   ```bash
   mkdir -p .roo/rules
   ```

2. Add rule files (numbered for order):
   ```
   .roo/rules/
   ├── 001-core.md
   ├── 002-code-style.md
   ├── 003-security.md
   ├── 004-debugging.md
   └── 005-communication.md
   ```

3. For mode-specific rules:
   ```
   .roo/rules-code/
   .roo/rules-architect/
   .roo/rules-review/
   ```

4. Global rules (shared across workspaces):
   ```
   ~/.roo/rules/
   ```

## Key Features

### Rule Loading Order
1. Global rules (`~/.roo/rules/`)
2. Mode-specific rules (`.roo/rules-{mode}/`)
3. `AGENTS.md` from workspace root
4. Workspace rules (`.roo/rules/`)

### Supported File Types
- `.md` (Markdown)
- `.txt` (Plain text)

Files are loaded recursively and alphabetically by filename.

**Source**: Roo Code Documentation + Industry Best Practices
