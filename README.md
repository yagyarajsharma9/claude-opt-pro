# Claude Optimizer Pro

Unified quality + cost optimization plugin for Claude Code. Orchestrates RTK, Caveman, CodeGraph, Claude Mem, Superpower, and Cost Optimizer with built-in commands (/compact, /clear, /compress, /init).

## Installation

```bash
claude plugin marketplace add claude-opt-pro/claude-opt-pro
claude plugin install claude-opt-pro@claude-opt-pro
```

**Or with auto-setup of integrated tools:**
```bash
npx claude-opt-pro install --with-integrations
```

## Quick Start

```bash
# Switch to cost mode for simple tasks
/opt-mode cost

# Switch to quality mode for critical work
/opt-mode quality

# View dashboard
/opt-dashboard

# Configure settings
/opt-config show

# Generate report
/opt-report
```

## Features

### Quality Optimization
- **Karpathy Principles** - Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven
- **Superpower TDD** - Red-green-refactor, debugging methodology, code review
- **CodeGraph** - Semantic code understanding (60% lower cost, 69% fewer tokens)
- **Claude Mem** - Persistent context across sessions (no re-explaining codebase)

### Cost Optimization
- **RTK** - Bash output compression (60-90% token reduction)
- **Caveman** - Output verbosity control (65% average reduction)
- **Cost Optimizer** - Mode-based cost reduction (30-60% savings)
- **Model Routing** - Auto-suggest Haiku for simple tasks

### Built-in Command Coordination
- **Auto /compact** at 60% context usage
- **Auto /clear** on task switch
- **Auto /compress** at 80% context (emergency)
- **Auto /init** for new projects

## Modes

| Mode | Quality Level | Cost Level | Best For |
|------|-------------|------------|----------|
| Quality | Maximum | Moderate | Critical features, bug fixes |
| Balanced (default) | High | High | Daily development |
| Cost | Moderate | Maximum | Simple tasks, exploration |

## Configuration

Edit `.claude/plugins/claude-opt-pro/config/user-config.json` or use `/opt-config`.

## Architecture

```
.claude/plugins/claude-opt-pro/
├── plugin.json
├── hooks/
│   ├── hooks.json
│   ├── session-start.js
│   ├── pre-tool-use.js
│   ├── post-tool-use.js
│   └── stop.js
├── skills/
│   └── claude-opt-pro/
│       ├── SKILL.md
│       ├── modes.md
│       ├── dashboard.md
│       └── config.md
├── commands/
│   ├── opt-mode.md
│   ├── opt-dashboard.md
│   ├── opt-config.md
│   └── opt-report.md
├── lib/
│   ├── config-manager.js
│   ├── mode-manager.js
│   ├── quality-engine.js
│   ├── cost-engine.js
│   └── builtin-coordinator.js
└── config/
    ├── default-config.json
    ├── modes.json
    └── user-config.json
```

## Requirements

- Claude Code >= 2.1.0
- Node.js >= 18.0.0

## License

MIT
