---
description: Detailed mode definitions and configurations for quality vs cost optimization
argument-hint: [quality|balanced|cost]
---

## Mode Definitions

### Quality Mode

**Focus:** Maximum correctness and code quality

**What's Enabled:**
- Karpathy principles: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven
- Superpower TDD: red-green-refactor, debugging methodology, subagent code review
- CodeGraph: full semantic graph for precise code understanding
- Claude Mem: full context persistence across sessions
- Quality gates: pre-commit checks, code review suggestions
- Min test coverage: 90%
- Max complexity: 8

**What's Relaxed:**
- Caveman: lite mode (minimal compression)
- RTK: on but non-aggressive
- Cost Optimizer: disabled (don't compromise quality for cost)
- Budget: $100/month (higher limit)

**Best For:**
- Critical features
- Bug fixes
- Security-sensitive code
- New architecture decisions
- Code reviews

### Balanced Mode (Default)

**Focus:** Optimal balance between quality and cost

**What's Enabled:**
- Karpathy principles
- Superpower TDD
- CodeGraph semantic context
- Claude Mem context
- Quality gates: pre-commit, code review
- Min test coverage: 80%
- Max complexity: 10
- Caveman: lite
- RTK: on, non-aggressive
- Cost Optimizer: standard mode
- Auto-compact at 60% context
- Budget: $50/month

**Best For:**
- Daily development
- Standard features
- General coding tasks
- Team collaboration

### Cost Mode

**Focus:** Maximum token savings

**What's Enabled:**
- Karpathy principles only (no Superpower TDD overhead)
- CodeGraph semantic context (still needed for precision)
- Claude Mem: minimal context (compression only)
- Quality gates: disabled
- Min test coverage: 60%
- Max complexity: 15
- Caveman: full mode (maximum compression)
- RTK: aggressive mode
- Cost Optimizer: strict mode (60-70% savings)
- Auto-compact at 50% context
- Budget: $20/month

**Best For:**
- Simple tasks
- Exploration and prototyping
- Quick fixes
- Routine commands

### Custom Mode

**Focus:** User-defined settings

**Configuration:**
Edit `.claude/plugins/claude-opt-pro/config.json` or run `/opt-config`