# Changelog

## v0.2.0 (2026-07-28)

### Major Feature: Auto Model Routing

**What's New:**
- **Autonomous LLM model routing** based on task complexity (Haiku/Sonnet/Opus)
- No developer intervention required - plugin automatically selects the best model
- Complexity assessment based on: file count, lines changed, task type, architecture involvement
- Tracks routing decisions and savings per session

**How It Works:**
1. Assesses task complexity (0.0 - 1.0) based on file changes, code patterns, and context
2. Classifies task type (simple/medium/complex) 
3. Automatically routes to the right model:
   - **Simple tasks** → Haiku (80% cost savings)
   - **Medium tasks** → Sonnet (50% cost savings)
   - **Complex tasks** → Opus (full quality)
4. Logs all routing decisions for transparency
5. Tracks token savings from model routing

**Configuration:**
```json
{
  "cost": {
    "model_routing": true,
    "auto_model_routing": true,
    "auto_model_routing_threshold": 0.5
  }
}
```

**Settings:**
- `model_routing` - Enable/disable model routing suggestions
- `auto_model_routing` - Enable/disable autonomous model switching
- `auto_model_routing_threshold` - Complexity threshold for auto-switching (0.0-1.0)

### Other Improvements
- Enhanced cost metrics tracking for model routing savings
- Updated README with comprehensive model routing documentation
- Added FUTURE_EXTENSIONS.md for planned features
- Test suite expanded (103 tests, 100% passing)
- Version bumped to 0.2.0

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

**Test Results:** 103/103 tests passing (100%)