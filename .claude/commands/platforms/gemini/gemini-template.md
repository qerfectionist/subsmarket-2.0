# Gemini Configuration

> Configuration for Google Gemini AI assistant

## File: GEMINI.md

Place this file in your project root to configure Gemini behavior.

```markdown
# Gemini Project Instructions

## Project Overview
**Name**: [Your Project Name]
**Type**: [Web Application / API / Library / CLI Tool]
**Language**: TypeScript
**Framework**: [Next.js / React / Node.js / Express]

## Code Generation Guidelines

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- Strict null checks
- ES2022 target

### Coding Standards

#### Style
- Use functional programming where appropriate
- Prefer const over let, never use var
- Use arrow functions for callbacks
- Destructure objects and arrays

#### Components (React)
- Functional components only
- Use hooks for state and effects
- Extract logic into custom hooks
- Keep components focused and small

#### Error Handling
- Always use try-catch for async operations
- Provide meaningful error messages
- Log errors appropriately
- Never swallow exceptions silently

### Project Structure
\`\`\`
src/
├── app/           # App router (Next.js)
├── components/    # UI components
│   ├── ui/        # Base components
│   └── features/  # Feature components
├── hooks/         # Custom hooks
├── lib/           # Utilities
├── types/         # TypeScript types
└── server/        # Server-side code
\`\`\`

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserData` |
| Constants | UPPER_SNAKE | `API_URL` |
| Files | kebab-case | `user-profile.tsx` |
| Types | PascalCase | `UserData` |

### Testing Requirements
- Unit tests with Vitest
- E2E tests with Playwright
- Minimum 80% coverage for critical paths
- Test files colocated with source

### Security Requirements
- Never expose secrets in code
- Validate all user input
- Use parameterized queries
- Sanitize HTML output
- Implement CSRF protection

## Forbidden Patterns
- `any` type without justification
- `console.log` in production
- Inline styles
- Magic numbers
- Nested ternary operators
- Callback hell
```

## Usage

Place this file as `GEMINI.md` in your project root.
Gemini will read and follow these instructions when assisting.
