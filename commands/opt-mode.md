---
description: Switch between quality, balanced, and cost optimization modes
argument-hint: [quality|balanced|cost|custom|list]
---

## Switch Optimization Mode

Current mode: {{current_mode}}

### Available Modes

| Mode | Description | Quality | Cost |
|------|-------------|---------|------|
| quality | Prioritize correctness and code quality | Maximum | Moderate |
| balanced | Balance quality and cost optimization | High | High |
| cost | Minimize token usage and cost | Moderate | Maximum |

### Usage

```
/opt-mode quality     # Prioritize correctness
/opt-mode balanced    # Balance quality and cost (default)
/opt-mode cost        # Minimize token usage
/opt-mode list        # Show available modes
```

### What Changes When You Switch Modes

**Quality Mode:**
- Enables Karpathy principles + Superpower TDD
- Enables CodeGraph semantic context
- Caveman mode: lite (minimal compression)
- RTK: on, non-aggressive
- Auto-compact at 70% context
- Budget: $100/month

**Balanced Mode (default):**
- Enables Karpathy principles + Superpower TDD
- Enables CodeGraph semantic context
- Caveman mode: lite
- RTK: on, non-aggressive
- Auto-compact at 60% context
- Budget: $50/month

**Cost Mode:**
- Karpathy principles only (no Superpower TDD)
- CodeGraph semantic context enabled
- Caveman mode: full (maximum compression)
- RTK: on, aggressive
- Auto-compact at 50% context
- Budget: $20/month

### Current Mode Configuration

```json
{{mode_config}}
```
