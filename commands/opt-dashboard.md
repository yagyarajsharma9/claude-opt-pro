---
description: View quality and cost optimization dashboard
---

## Dashboard

### Current Status

| Metric | Value |
|--------|-------|
| Mode | {{mode}} |
| Session Start | {{start_time}} |
| Karpathy Compliance | {{compliance}}% |
| Quality Checks | {{passed_checks}}/{{total_checks}} passed |
| Tokens Saved | {{tokens_saved}} |
| Cost Saved | ${{cost_saved}} |

### Integration Status

| Integration | Status | Savings |
|-------------|--------|---------|
| RTK | {{rtk_status}} | {{rtk_savings}} tokens |
| Caveman | {{caveman_status}} ({{caveman_mode}}) | {{caveman_savings}} tokens |
| CodeGraph | {{codegraph_status}} | {{codegraph_savings}} tokens |
| Claude Mem | {{claude_mem_status}} | {{claude_mem_savings}} tokens |
| Cost Optimizer | {{cost_opt_status}} | {{cost_opt_savings}} tokens |

### Built-in Command Activity

| Command | Times Triggered | Last Triggered |
|---------|----------------|---------------|
| /compact | {{compact_count}} | {{last_compact}} |
| /clear | {{clear_count}} | {{last_clear}} |
| /compress | {{compress_count}} | {{last_compress}} |
| /init | {{init_count}} | {{last_init}} |

### Quality Metrics

- Bug Rate: {{bug_rate}}%
- Test Coverage: {{test_coverage}}%
- Avg Response Quality: {{quality_score}}/10

### Cost Metrics

- Session Tokens: {{session_tokens}}
- Tokens Saved: {{tokens_saved}}
- Cost Saved: ${{cost_saved}}
- Budget Remaining: ${{budget_remaining}}
- Projected Monthly: ${{projected_monthly}}

### Recommendations

{{recommendations}}

### Run

- `/opt-mode` - Switch modes
- `/opt-config` - Configure settings
- `/opt-report` - Generate detailed report