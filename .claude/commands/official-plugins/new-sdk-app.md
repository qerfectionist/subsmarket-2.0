# /new-sdk-app - Agent SDK Bootstrapper

Create new Agent SDK applications with best practices.

## Usage

```
/new-sdk-app python my-agent
/new-sdk-app typescript my-agent
```

## Instructions

When the user invokes `/new-sdk-app`:

1. **Detect language**: Python or TypeScript
2. **Create project structure**:
   - For Python: Create virtual env, requirements.txt, main agent file
   - For TypeScript: Create package.json, tsconfig.json, src/index.ts

3. **Setup Agent SDK**:
   ```python
   # Python
   from anthropic import Anthropic
   from anthropic.types.beta import BetaMessage

   client = Anthropic()
   ```

   ```typescript
   // TypeScript
   import Anthropic from '@anthropic-ai/sdk';

   const client = new Anthropic();
   ```

4. **Include best practices**:
   - Proper error handling
   - Type safety
   - Environment variable management
   - Logging setup

5. **Validate with agents**:
   - Use `agent-sdk-verifier-py` for Python projects
   - Use `agent-sdk-verifier-ts` for TypeScript projects
