# Web Design Guidelines - Vercel

> Review UI code for Web Interface Guidelines compliance

## Description

Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".

## Usage

```
/web-design-guidelines src/components
/web-design-guidelines App.tsx
/web-design-guidelines --check-accessibility
```

## Instructions

When the user invokes this skill:

### Step 1: Fetch Latest Guidelines

Fetch fresh guidelines before each review:
```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

### Step 2: Read Target Files

Read the specified files or ask user for file pattern.

### Step 3: Check Against Rules

Apply all rules from the fetched guidelines covering:

#### Visual Design
- Typography hierarchy and readability
- Color contrast and accessibility
- Spacing and layout consistency
- Visual hierarchy

#### Interaction Design
- Touch target sizes (min 44x44px)
- Hover/focus states
- Loading states and feedback
- Error states and messaging

#### Accessibility (WCAG 2.1)
- Alt text for images
- Keyboard navigation
- ARIA labels
- Color contrast ratios
- Focus indicators

#### Performance
- Image optimization
- Lazy loading
- Above-the-fold content
- Animation performance

#### Responsiveness
- Mobile-first design
- Breakpoint consistency
- Touch vs mouse interactions
- Viewport considerations

### Step 4: Output Findings

Use terse `file:line` format:

```
components/Button.tsx:15 - Missing focus state
components/Card.tsx:42 - Touch target too small (32px)
pages/Home.tsx:28 - Image missing alt text
styles/global.css:15 - Color contrast ratio 3.2:1 (needs 4.5:1)
```

### Severity Levels

| Level | Description |
|-------|-------------|
| 🔴 Critical | Accessibility violation, unusable |
| 🟡 Warning | UX issue, best practice violation |
| 🟢 Suggestion | Enhancement opportunity |

## Source

Based on [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)
