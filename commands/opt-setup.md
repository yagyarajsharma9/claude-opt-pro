---
description: One-time setup wizard for Claude Optimizer Pro
---

## Setup Wizard

This one-time setup configures Claude Optimizer Pro for your development workflow.

### Start Setup

```
/opt-setup
```

### What It Does

1. **Detects your coding agent** (Claude Code, Cursor, Codex, Gemini, etc.)
2. **Asks your preferred optimization mode** (Quality / Balanced / Cost)
3. **Asks about model routing** - auto-select Haiku/Sonnet/Opus based on task complexity
4. **Asks which integrations to enable** (RTK, Caveman, CodeGraph, Claude Mem, etc.)
5. **Sets your monthly budget**
6. **Stores everything permanently**

### After Setup

- Model routing is **fully autonomous** - no developer intervention needed
- Mode persists across sessions
- Integrations auto-configure for your agent
- Run `/opt-dashboard` to see metrics
- Run `/opt-config` to change settings anytime

### Agent Support

The setup wizard automatically detects and configures for:

| Agent | Config File | Auto-detect |
|-------|-------------|-------------|
| Claude Code | `.claude/` | ✅ |
| Cursor | `.cursor/` | ✅ |
| Codex | `.codex/` | ✅ |
| Gemini CLI | `.gemini/` | ✅ |
| Windsurf | `.windsurf/` | ✅ |
| GitHub Copilot | `.github/` | ✅ |
| Cline | `.cline/` | ✅ |
| OpenCode | `.opencode/` | ✅ |

### Re-run Setup

To reconfigure, run:
```
/opt-setup --reset
```

This resets all settings and walks through setup again.