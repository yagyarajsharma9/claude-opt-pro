---
description: Claude Optimizer Pro - Unified quality and cost optimization for Claude Code
argument-hint: [mode|dashboard|config|report|install|status]
---

## Claude Optimizer Pro

Unified quality + cost optimization plugin for Claude Code.

### Available Commands

- `/opt-mode` - Switch between quality, balanced, and cost modes
- `/opt-dashboard` - Show quality and cost metrics
- `/opt-config` - Configure plugin settings
- `/opt-report` - Generate session report

### Quick Start

```
/opt-mode balanced    # Set balanced mode (default)
/opt-mode quality     # Prioritize correctness
/opt-mode cost        # Minimize token usage
/opt-dashboard        # View metrics
```

### What This Plugin Does

**Quality Optimization:**
- Integrates Karpathy principles (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven)
- Integrates Superpower TDD methodology
- Integrates CodeGraph semantic code understanding
- Integrates Claude Mem persistent context

**Cost Optimization:**
- RTK bash output compression (60-90% reduction)
- Caveman output verbosity control (65% reduction)
- Model routing (Haiku for simple, Opus for complex)
- Auto-compaction coordination with /compact
- Auto-clear coordination with /clear

**Built-in Command Coordination:**
- Auto-triggers /compact at 60% context
- Auto-triggers /clear on task switch
- Auto-triggers /compress at 80% context
- Auto-suggests /init for new projects

### Mode Details

| Mode | Quality | Cost | Best For |
|------|---------|------|----------|
| quality | Maximum | Moderate | Critical features, bug fixes |
| balanced | High | High | Daily development |
| cost | Moderate | Maximum | Simple tasks, exploration |

### Current Mode: {{mode}}

Run `/opt-mode` to see available modes.
