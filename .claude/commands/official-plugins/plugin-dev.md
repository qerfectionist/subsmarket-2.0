# Plugin Development

Eight-phase workflow for creating Claude Code plugins.

## Usage

```
/plugin-dev:create-plugin <plugin-name>
```

## Phases

1. **Discovery** - Understand plugin requirements
2. **Architecture** - Design plugin structure
3. **Commands** - Create slash commands
4. **Agents** - Build specialized agents
5. **Skills** - Define reusable skills
6. **Hooks** - Implement event hooks
7. **MCP Integration** - Add MCP server support
8. **Validation** - Test and validate plugin

## Bundled Agents

- **agent-creator** - Creates specialized agents
- **plugin-validator** - Validates plugin structure
- **skill-reviewer** - Reviews skill definitions

## Plugin Structure

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   └── my-command.md
├── agents/
│   └── my-agent.md
├── skills/
│   └── my-skill.md
├── hooks/
│   └── my-hook.js
├── .mcp.json
└── README.md
```

## Features

- Automatic structure generation
- Best practices validation
- MCP server scaffolding
- Documentation generation

$ARGUMENTS
