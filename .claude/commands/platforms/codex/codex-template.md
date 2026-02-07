# OpenAI Codex Configuration

> Configuration for OpenAI Codex CLI agent

## File: codex.md or CODEX.md

Place this file in your project root to configure Codex behavior.

```markdown
# Codex Project Instructions

## Project Overview
- **Name**: [Your Project Name]
- **Type**: [Web App / API / Library]
- **Stack**: TypeScript, React, Node.js

## Code Generation Rules

### Style Guidelines
1. Use TypeScript with strict mode
2. Prefer functional programming patterns
3. Use async/await for asynchronous code
4. Handle all errors explicitly

### Project Structure
\`\`\`
src/
├── components/    # React components
├── hooks/         # Custom hooks
├── lib/           # Utilities and helpers
├── types/         # TypeScript types
├── api/           # API routes
└── tests/         # Test files
\`\`\`

### Naming Conventions
- **Components**: PascalCase (UserProfile.tsx)
- **Functions**: camelCase (getUserData)
- **Constants**: SCREAMING_SNAKE_CASE (API_BASE_URL)
- **Files**: kebab-case (user-profile.tsx)

### Best Practices
- No `any` types - use proper typing
- Extract reusable logic into custom hooks
- Keep functions under 50 lines
- Write unit tests for business logic

### Forbidden Patterns
- console.log in production code
- Inline styles
- Magic numbers
- Deeply nested callbacks
- Mutation of state directly

### Preferred Libraries
| Purpose | Library |
|---------|---------|
| State | Zustand, React Query |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS |
| Testing | Jest, Vitest |
| HTTP | Axios, fetch |

## Safety Rules
- Never expose API keys in code
- Validate all user input
- Use parameterized queries for DB
- Sanitize output to prevent XSS
```

## Usage

Place this file as `codex.md` or `CODEX.md` in your project root.
Codex will read and follow these instructions.
