# React Best Practices - Vercel Engineering

> From Vercel Labs: 51 performance rules for React and Next.js applications

## Description

This skill provides comprehensive React and Next.js performance optimization guidelines from Vercel Engineering. It covers async patterns, bundle optimization, client-side performance, server components, and rendering optimizations.

## Usage

```
/react-best-practices review src/components
/react-best-practices check App.tsx
```

## Instructions

When the user invokes this skill or asks about React/Next.js best practices:

### Categories of Rules

#### 1. Async Patterns (async-*)
- **defer-await**: Defer awaits to avoid waterfalls
- **parallel**: Use Promise.all for parallel fetches
- **suspense-boundaries**: Proper Suspense boundary placement
- **dependencies**: Minimize async dependencies

#### 2. Bundle Optimization (bundle-*)
- **barrel-imports**: Avoid barrel file imports, use direct imports
- **dynamic-imports**: Use dynamic imports for code splitting
- **conditional**: Conditionally load heavy components
- **defer-third-party**: Defer third-party scripts
- **preload**: Preload critical resources

#### 3. Client-Side Performance (client-*)
- **event-listeners**: Proper event listener cleanup
- **passive-event-listeners**: Use passive event listeners
- **swr-dedup**: Deduplicate SWR/fetch requests
- **localstorage-schema**: Version localStorage data

#### 4. JavaScript Optimization (js-*)
- **set-map-lookups**: Use Set/Map for O(1) lookups
- **cache-function-results**: Memoize expensive computations
- **early-exit**: Return early from functions
- **combine-iterations**: Combine array iterations
- **tosorted-immutable**: Use toSorted for immutability

#### 5. Rendering (rendering-*)
- **content-visibility**: Use content-visibility for offscreen content
- **hoist-jsx**: Hoist static JSX outside components
- **usetransition-loading**: Use useTransition for loading states
- **conditional-render**: Optimize conditional rendering

#### 6. Re-render Prevention (rerender-*)
- **memo**: Proper use of React.memo
- **lazy-state-init**: Lazy state initialization
- **functional-setstate**: Use functional setState
- **derived-state**: Avoid derived state
- **dependencies**: Minimize useEffect dependencies

#### 7. Server Components (server-*)
- **auth-actions**: Authenticate in Server Actions
- **parallel-fetching**: Parallel data fetching
- **cache-react**: Use React cache
- **dedup-props**: Deduplicate props
- **serialization**: Minimize serialized data

### Review Process

1. **Analyze the code** for violations of each category
2. **Prioritize findings** by impact level:
   - CRITICAL: Performance degradation >100ms
   - HIGH: Noticeable performance impact
   - MEDIUM: Best practice violation
   - LOW: Minor optimization opportunity

3. **Output format**:
   ```
   file.tsx:42 - [HIGH] Avoid barrel imports, use direct import
   file.tsx:58 - [CRITICAL] Async waterfall detected, use Promise.all
   ```

4. **Provide fix examples** for each issue

### Example Fixes

**Bad - Barrel Import:**
```tsx
import { Button, Card, Modal } from '@/components';
```

**Good - Direct Import:**
```tsx
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
```

**Bad - Async Waterfall:**
```tsx
const user = await getUser();
const posts = await getPosts(user.id);
const comments = await getComments(posts[0].id);
```

**Good - Parallel Fetch:**
```tsx
const user = await getUser();
const [posts, profile] = await Promise.all([
  getPosts(user.id),
  getProfile(user.id)
]);
```

## Source

Based on [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)
