# Aider Configuration

> Configuration for Aider AI pair programming assistant

## File: .aider.conf.yml

Place this file in your project root to configure Aider behavior.

```yaml
# Aider Configuration

# Model settings
model: gpt-4-turbo
edit-format: diff

# File handling
auto-commits: true
dirty-commits: false
attribute-author: true
attribute-committer: true

# Code style
lint-cmd: npm run lint
test-cmd: npm test

# Context
read:
  - README.md
  - package.json
  - tsconfig.json

# Ignore patterns (also respects .gitignore)
ignore:
  - node_modules/
  - dist/
  - .next/
  - coverage/

# Git settings
git-depth: 10
show-diffs: true
```

## File: .aider.input.md

Optional file for persistent instructions:

```markdown
# Aider Instructions

## Project Context
This is a Next.js 14 application using:
- TypeScript with strict mode
- Tailwind CSS for styling
- Prisma for database
- NextAuth for authentication

## Code Style
- Use functional components
- Prefer server components where possible
- Use Zod for validation
- Handle errors with try-catch

## When Making Changes
1. Follow existing code patterns
2. Add TypeScript types
3. Update tests if needed
4. Keep commits atomic
```

## Usage

1. Copy `.aider.conf.yml` to project root
2. Optionally add `.aider.input.md` for persistent context
3. Run `aider` in your project directory
