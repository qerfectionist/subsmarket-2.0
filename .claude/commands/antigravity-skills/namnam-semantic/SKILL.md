---
name: namnam-semantic
description: LLM-powered codebase understanding with embeddings, RAG, and semantic search. Automatically provides context for any coding task. Triggers on code questions, architecture queries, finding similar code, or when deep codebase understanding is needed.
license: MIT
metadata:
  author: NamNam
  version: "2.5.1"
  auto_activate: true
  priority: high
---

# 🧠 NamNam Semantic - Augment AI-like Features

> **Automatic codebase understanding** through embeddings and RAG.

## Auto-Activation

This skill automatically activates when:
- User asks questions about the codebase
- User needs to find related code
- User wants to understand architecture
- Any complex coding task that needs context

## How to Use (Automatically!)

When this skill is active, you should **automatically run these commands** to get context:

### 1. For Any Question About Code
```bash
namnam sem auto-context -q "<user's question>"
```

### 2. For Finding Similar Code
```bash
namnam sem similar <file-path>
```

### 3. For Semantic Search
```bash
namnam sem search "<keywords>"
```

### 4. For Full RAG Answer
```bash
namnam sem ask "<question>"
```

## Auto-Context Integration

**IMPORTANT**: Before answering any question about the codebase, first run:

```bash
namnam sem auto-context -q "<user's question or task>" --json
```

This returns relevant code context that you should use in your response.

## Example Workflow

User: "How does authentication work in this project?"

You should:
1. Run: `namnam sem auto-context -q "authentication" --json`
2. Read the context from the output
3. Use that context to provide an accurate answer

## Quick Reference

| Command | Description |
|---------|-------------|
| `namnam sem auto-context -q "<query>"` | Get relevant context for a task |
| `namnam sem search "<query>"` | Semantic search |
| `namnam sem ask "<question>"` | RAG-powered Q&A |
| `namnam sem similar <file>` | Find similar code |
| `namnam sem stats` | Check index status |

## Setup (One-time)

If semantic index is not built, run:
```bash
namnam sem index
```

Or with specific provider:
```bash
namnam sem index --provider ollama
namnam sem index --provider openai
```

## Supported Providers

- **Ollama** (local, free) - Default
- **OpenAI** (cloud, fast)
- **Voyage** (code-optimized)
- **Anthropic** (for LLM)

## Integration Note

This skill works best when the semantic index is already built. The index is automatically created during `npm install namnam-skills`.
