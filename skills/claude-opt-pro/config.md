---
description: Configure quality and cost optimization settings
argument-hint: [set|show|reset|integrations]
---

## Configuration

### Show Current Config

```
/opt-config show
```

### Set Mode

```
/opt-config mode quality
/opt-config mode balanced
/opt-config mode cost
```

### Toggle Integrations

```
/opt-config integration rtk on
/opt-config integration rtk off
/opt-config integration caveman on
/opt-config integration caveman off
/opt-config integration codegraph on
/opt-config integration codegraph off
/opt-config integration claude_mem on
/opt-config integration claude_mem off
/opt-config integration cost_optimizer on
/opt-config integration cost_optimizer off
/opt-config integration superpower on
/opt-config integration superpower off
```

### Set Caveman Mode

```
/opt-config caveman lite
/opt-config caveman full
/opt-config caveman ultra
/opt-config caveman wenyan
```

### Set Budget

```
/opt-config budget 50.00
/opt-config budget 100.00
/opt-config budget 20.00
```

### Set Auto-Compact Threshold

```
/opt-config auto-compact 60
/opt-config auto-compact 50
/opt-config auto-compact 70
```

### Reset to Defaults

```
/opt-config reset
```

### Configuration File Location

```
.claude/plugins/claude-opt-pro/config/user-config.json
```

### Integration Status

| Integration | Description | Install Command |
|-------------|-------------|-----------------|
| RTK | Bash output compression | `rtk init -g` |
| Caveman | Output verbosity reduction | `claude plugin install caveman@caveman` |
| CodeGraph | Semantic code graph | `codegraph install` |
| Claude Mem | Persistent memory | `npx claude-mem install` |
| Cost Optimizer | Mode-based cost reduction | `/plugin install cost-mode` |
| Superpower | TDD and debugging skills | `/plugin install superpowers` |