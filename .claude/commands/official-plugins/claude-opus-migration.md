# Claude Opus 4.5 Migration

Automates migration of Claude model configurations to Opus 4.5.

## Usage

```
/claude-opus-migration
```

## What it does

1. **Model String Updates**: Migrates Sonnet/Opus model strings to new Opus 4.5 format
2. **Beta Headers**: Updates deprecated beta headers to current API standards
3. **Prompt Optimization**: Adjusts prompts for Opus 4.5 capabilities
4. **Configuration Audit**: Reviews and updates SDK configurations

## Migration Steps

1. Scan codebase for Claude model references
2. Identify deprecated patterns
3. Generate migration plan
4. Apply updates with verification
5. Test API calls post-migration

## Supported Patterns

- `claude-3-opus` → `claude-opus-4-5-20251101`
- `claude-3-sonnet` → `claude-sonnet-4-20250514`
- Beta header deprecations
- Prompt format updates

$ARGUMENTS
