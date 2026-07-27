# Changelog

## v0.1.0 (2026-07-28)

### Initial Release - Claude Optimizer Pro

**New Features:**
- Unified quality + cost optimization plugin for Claude Code
- Three optimization modes: Quality, Balanced (default), Cost
- Integration coordination with external plugins: RTK, Caveman, CodeGraph, Claude Mem, Superpower, Cost Optimizer
- Built-in command auto-triggering: /compact at 60% context, /clear on task switch, /compress at 80% context
- Karpathy principles quality engine (4 principles: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven)
- RTK bash output compression integration (60-90% token reduction)
- Caveman output compression integration (65% average reduction)
- Cost Optimizer mode integration (30-60% savings)
- Model routing suggestions (Haiku for simple, Opus for complex)
- Session dashboard with quality and cost metrics
- Unified configuration system
- Auto-installation of integrated tools

**Commands:**
- `/opt-mode` - Switch between quality, balanced, and cost modes
- `/opt-dashboard` - View quality and cost metrics
- `/opt-config` - Configure settings and integrations
- `/opt-report` - Generate session optimization report

**File Structure:**
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
├── config/
│   ├── default-config.json
│   ├── modes.json
│   └── user-config.json
├── README.md
└── tests/test-suite.js
```

**Test Results:** 103/103 tests passing (100%)