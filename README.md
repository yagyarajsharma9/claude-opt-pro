# Claude Optimizer Pro

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-%3E%3D2.1-FF6B6B.svg)](https://claude.ai/code)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org)

**Unified quality + cost optimization plugin for Claude Code.** One install replaces 6 separate plugins. Orchestrates RTK, Caveman, CodeGraph, Claude Mem, Superpower, and Cost Optimizer alongside built-in commands (`/compact`, `/clear`, `/compress`, `/init`).

## 🚀 Quick Start

### Install from GitHub
```bash
cd your-project
claude plugin install yagayrajsharma9/claude-opt-pro
```

### Or Clone + Install
```bash
git clone https://github.com/yagayrajsharma9/claude-opt-pro.git
cd claude-opt-pro
npm install  # installs all integrated tools automatically
claude plugin install claude-opt-pro
```

### Verify
```bash
/opt-mode balanced     # Set default balanced mode
/opt-dashboard         # View metrics
```

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLAUDE OPTIMIZER PRO                               │
│                     Unified Quality + Cost Plugin                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
   ┌──────────────┐       ┌──────────────┐       ┌────────────── ┐
   │  HOOKS LAYER │       │  ENGINE LAYER│       │  SKILLS /     │
   │              │       │              │       │  COMMANDS     │
   │              │       │              │       │               │
   │ SessionStart │       │ ConfigManager│       │ /opt-mode     │
   │ PreToolUse   │       │ ModeManager  │       │ /opt-dashboard│
   │ PostToolUse  │       │ QualityEngine│       │ /opt-config   │
   │ Stop         │       │ CostEngine   │       │ /opt-report   │
   └──────┬───────┘       └──────┬───────┘       └────────────── ┘
          │                      │
          ▼                      ▼
   ┌──────────────┐       ┌──────────────┐
   │ BUILT-IN     │       │ INTEGRATION  │
   │ COORDINATOR  │       │ ADAPTERS     │
   │              │       │              │
   │ Auto/compact │       │ RTK (60-90%  │
   │ Auto/clear   │       │   bash output│
   │ Auto/compress│       │ Caveman (65% │
   │ Auto/init    │       │   output)    │
   │ /compact     │       │ CodeGraph    │
   │ /clear       │       │ Claude Mem   │
   │ /compress    │       │ Superpower   │
   │ /init        │       │ Cost Opt     │
   │ Karpathy     │       │ (6 external  │
   │              │       │  plugins)    │
   └──────────────┘       └──────────────┘
          │                      │
          ▼                      ▼
   ┌──────────────┐       ┌────────────── ┐
   │ BUILT-IN     │       │ EXTERNAL      │
   │ COMMANDS     │       │ TOOLS         │
   │              │       │               │
   │ /compact     │       │ RTK           │
   │ /clear       │       │ Caveman       │
   │ /compress    │       │ CodeGraph     │
   │ /init        │       │ Claude Mem    │
   │ /model       │       │ Superpower    │
   │ Karpathy     │       │ Cost Optimizer│
   │ Skills       │       │               │
   └──────────────┘       └────────────── ┘
```

### Data Flow

```
Session Start
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  SessionStart Hook                                              │
│  • Check/auto-install integrations                              │
│  • Load mode config (quality/balanced/cost)                     │
│  • Check if CLAUDE.md exists → suggest /init                    │
│  • Log session start                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   PreToolUse Hook   PostToolUse Hook     Stop Hook
   • RTK rewrite    • Log token usage    • Generate report
   • Quality gate   • Quality checks     • Auto /compact
   • Model routing  • Cost savings       • Save metrics
   • /compact check • Built-in command   • Suggest next mode
     (>60% context)   coordinator          (if needed)
          │                │                │
          ▼                ▼                ▼
   ┌─────────────────────────────────────────────────────────┐
   │  METRICS DASHBOARD  (/opt-dashboard)                    │
   │  Quality │ Cost │ Integration Status │ Recommendations  │
   └─────────────────────────────────────────────────────────┘
```

## 🧩 Features

### Quality Optimization
| Tool | What It Does | Impact |
|------|-------------|--------|
| **Karpathy Principles** | 4 behavioral rules (TBB, SF, SC, GD) | Reduces common coding failures |
| **Superpower TDD** | Red-green-refactor, debugging, code review | Catches bugs before merge |
| **CodeGraph** | Semantic code graph (37 languages, 45 MCP tools) | 60% lower cost, 69% fewer tokens |
| **Claude Mem** | Persistent context across sessions | No re-explaining codebase |

### Cost Optimization
| Tool | What It Does | Impact |
|------|-------------|--------|
| **RTK** | Bash output compression (100+ commands) | 60-90% token reduction |
| **Caveman** | Output verbosity control (4 modes) | 65% average output reduction |
| **Cost Optimizer** | Mode-based cost reduction | 30-60% savings |
| **Model Routing** | Auto-suggest Haiku/Opus based on task | 80% savings on simple tasks |

### Built-in Command Coordination
| Built-in Command | Auto-Trigger Condition |
|------------------|----------------------|
| `/compact` | Context > 60% (balanced) |
| `/clear` | Task switch detected |
| `/compress` | Context > 80% (emergency) |
| `/init` | New project detected (no CLAUDE.md) |

## 🎮 Modes

### Quality Mode
Best for: Critical features, bug fixes, security-sensitive code
- Karpathy: ✅ | TDD: ✅ | CodeGraph: ✅ | Claude Mem: ✅
- Caveman: lite | RTK: on | Budget: $100/mo

### Balanced Mode (default)
Best for: Daily development, general coding
- Karpathy: ✅ | TDD: ✅ | CodeGraph: ✅ | Claude Mem: ✅
- Caveman: lite | RTK: on | Budget: $50/mo

### Cost Mode
Best for: Simple tasks, exploration, routine commands
- Karpathy: ✅ | TDD: ❌ | CodeGraph: ✅ | Claude Mem: minimal
- Caveman: full | RTK: aggressive | Budget: $20/mo

## 📋 Commands

| Command | Description |
|---------|-------------|
| `/opt-mode <mode>` | Switch quality/balanced/cost mode |
| `/opt-dashboard` | View quality + cost metrics |
| `/opt-config show` | Show current settings |
| `/opt-config mode <mode>` | Change active mode |
| `/opt-config integration <name> on/off` | Toggle an integration |
| `/opt-config budget <amount>` | Set monthly budget |
| `/opt-config reset` | Reset to defaults |
| `/opt-report` | Generate detailed session report |

## 🛠️ Installation Guide (Another Laptop)

### Prerequisites
- Claude Code CLI installed (`npm install -g @anthropic/claude-code` or download from claude.ai)
- Node.js 18+
- Git

### Install the Plugin
```bash
# 1. Navigate to your project
cd /your/project

# 2. Install from GitHub marketplace
claude plugin marketplace add yagayrajsharma9/claude-opt-pro
claude plugin install claude-opt-pro@claude-opt-pro

# 3. Or clone and install locally
git clone https://github.com/yagayrajsharma9/claude-opt-pro.git
cd claude-opt-pro
claude plugin install
```

### Set Up Integrated Tools (Optional)
```bash
# Auto-install all integrations
/opt-config integrations all on
```

Or install individually:
```bash
# RTK - Bash output compression
brew install rtk  # or download binary
rtk init -g

# Caveman - Output compression plugin
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman

# CodeGraph - Semantic code graph
npm install -g @colbymchenry/codegraph
codegraph install

# Claude Mem - Persistent memory
npx claude-mem install

# Cost Optimizer - Cost mode skill
claude plugin marketplace add Sagargupta16/claude-cost-optimizer
claude plugin install cost-mode@claude-cost-optimizer

# Superpower - TDD and debugging skills
claude plugin marketplace add obra/superpowers
claude plugin install superpowers@superpowers-marketplace
```

### Verify Installation
```bash
# Start Claude Code
claude

# Check mode
/opt-mode balanced

# View dashboard
/opt-dashboard

# Run test suite
node .claude/plugins/claude-opt-pro/tests/test-suite.js
```

### Configure for Your Project
```bash
# Set mode based on your needs
/opt-mode quality        # For critical work
/opt-mode balanced       # For daily use (default)
/opt-mode cost           # For budget-conscious work

# Set budget limit
/opt-config budget 50.00

# Toggle integrations
/opt-config integration rtk on
/opt-config integration caveman on
/opt-config integration codegraph on
```

## 📊 Expected Results

### Without Plugin
| Metric | Baseline |
|--------|----------|
| Output tokens | 100% |
| Bash output tokens | 100% |
| Input tokens | 100% |
| Bug rate | Baseline |
| Setup complexity | 5+ commands |

### With Plugin (Balanced Mode)
| Metric | Improvement |
|--------|-------------|
| Output tokens | ~40% savings |
| Bash output tokens | ~70% savings |
| Input tokens | ~30% savings |
| Bug rate | ~30% reduction |
| Setup complexity | 1 command |

### With Plugin (Cost Mode)
| Metric | Improvement |
|--------|-----------|
| Output tokens | ~70% savings |
| Bash output tokens | ~90% savings |
| Input tokens | ~50% savings |
| Bug rate | ~15% reduction |
| Setup complexity | 1 command |

## 🆚 How It Differs from Using Tools Separately

| Aspect | Separate Tools | Claude Optimizer Pro |
|--------|---------------|---------------------|
| Install commands | 5+ | 1 |
| Mode switching | Manual per tool | Unified `/opt-mode` |
| Coordination | None | Auto-trigger /compact, /clear, etc. |
| Dashboard | 6 different UIs | Single `/opt-dashboard` |
| Config files | 6+ locations | Unified `config.json` |
| Quality vs Cost tradeoff | Manual | Automatic mode-based |

## 🧪 Testing

### Run Automated Tests
```bash
node .claude/plugins/claude-opt-pro/tests/test-suite.js
```
Expected: **103/103 tests passing (100%)**

### Manual Testing Checklist
- [ ] Plugin installs via marketplace
- [ ] Mode switching works
- [ ] Quality checks run on code changes
- [ ] RTK compression activates
- [ ] /compact auto-triggers at threshold
- [ ] Dashboard shows correct metrics
- [ ] Config persists across sessions
- [ ] Report generates correctly

See `test-project/TESTING.md` for detailed manual testing steps.

## 📁 Project Structure

```
claude-opt-pro/
├── plugin.json                  # Plugin manifest
├── hooks/
│   ├── hooks.json               # Hook wiring configuration
│   ├── session-start.js         # SessionStart hook
│   ├── pre-tool-use.js          # PreToolUse hook (RTK, quality checks)
│   ├── post-tool-use.js         # PostToolUse hook (metrics logging)
│   └── stop.js                  # Stop hook (report generation)
├── skills/
│   └── claude-opt-pro/
│       ├── SKILL.md             # Main skill entrypoint
│       ├── modes.md             # Mode definitions
│       ├── dashboard.md         # Dashboard skill
│       └── config.md            # Configuration skill
├── commands/
│   ├── opt-mode.md              # /opt-mode command
│   ├── opt-dashboard.md         # /opt-dashboard command
│   ├── opt-config.md            # /opt-config command
│   └── opt-report.md            # /opt-report command
├── lib/
│   ├── config-manager.js        # Configuration management
│   ├── mode-manager.js          # Mode switching logic
│   ├── quality-engine.js        # Quality optimization engine
│   ├── cost-engine.js           # Cost optimization engine
│   └── builtin-coordinator.js   # Built-in command coordinator
├── config/
│   ├── default-config.json      # Default configuration
│   ├── modes.json               # Mode definitions
│   └── user-config.json         # User settings (gitignored)
├── tests/
│   └── test-suite.js            # Automated test suite (103 tests)
├── README.md                     # This file
├── CHANGELOG.md                  # Version history
├── LICENSE                       # MIT License
└── .gitignore                    # Git ignore rules
```

## 🔧 Requirements

- **Claude Code** >= 2.1.0
- **Node.js** >= 18.0.0
- **Git** (for version control)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [obra/superpowers](https://github.com/obra/superpowers) - Skills framework
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) - Persistent memory
- [rtk-ai/rtk](https://github.com/rtk-ai/rtk) - Token compression
- [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) - Output compression
- [codegraph-ai/CodeGraph](https://github.com/codegraph-ai/codegraph) - Semantic code graph
- [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) - Behavioral principles
- [Sagargupta16/claude-cost-optimizer](https://github.com/Sagargupta16/claude-cost-optimizer) - Cost optimization

## 📧 Contact

- **GitHub:** [@yagyarajsharma9](https://github.com/yagyarajsharma9)
- **Email:** yagayrajsharma@gmail.com

---

**Made with 🪨 by Claude Optimizer Pro Team**


