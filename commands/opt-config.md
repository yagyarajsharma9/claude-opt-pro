---
description: Configure quality and cost optimization settings
---

## Configure Settings

### View Current Settings

```
/opt-config show
```

### Available Commands

| Command | Description |
|---------|-------------|
| `/opt-config show` | Show current configuration |
| `/opt-config mode <mode>` | Switch mode (quality/balanced/cost) |
| `/opt-config integration <name> on/off` | Toggle integration |
| `/opt-config caveman <mode>` | Set Caveman mode (lite/full/ultra) |
| `/opt-config budget <amount>` | Set monthly budget limit |
| `/opt-config auto-compact <percent>` | Set auto-compact threshold |
| `/opt-config auto-clear on/off` | Toggle auto-clear on task switch |
| `/opt-config reset` | Reset to defaults |

### Current Settings

{{current_config}}

### Integration Install Commands

| Integration | Install |
|-------------|---------|
| RTK | `rtk init -g` |
| Caveman | `claude plugin install caveman@caveman` |
| CodeGraph | `codegraph install` |
| Claude Mem | `npx claude-mem install` |
| Cost Optimizer | `/plugin install cost-mode` |
| Superpower | `/plugin install superpowers` |

### Configuration File

All settings are stored in: `.claude/plugins/claude-opt-pro/config/user-config.json`

This file is gitignored by default. Do not commit user-specific settings.