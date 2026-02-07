# Security Guidance

Watches for risky security patterns during code edits and warns about potential vulnerabilities.

## Usage

This skill automatically activates during code edits to detect:

## Detected Patterns

1. **Command Injection** - Unsafe shell command construction
2. **XSS (Cross-Site Scripting)** - Unescaped user input in HTML
3. **eval() Usage** - Dynamic code execution risks
4. **Dangerous HTML** - innerHTML with user data
5. **Pickle Deserialization** - Python pickle security risks
6. **os.system() Calls** - Unsafe system command execution
7. **SQL Injection** - Unparameterized queries
8. **Path Traversal** - Unsanitized file paths
9. **Hardcoded Secrets** - API keys, passwords in code

## How It Works

- Hooks into PreToolUse events
- Scans code changes for risky patterns
- Provides warnings with remediation suggestions
- Suggests secure alternatives

## Example Warnings

```
⚠️ Potential Command Injection detected
  Line 42: os.system(f"rm -rf {user_input}")
  Suggestion: Use subprocess with shell=False and sanitize input
```

$ARGUMENTS
