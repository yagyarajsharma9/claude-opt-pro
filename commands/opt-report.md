---
description: Generate detailed session optimization report
---

## Session Report

### Summary

```
Session Report - {{timestamp}}
Mode: {{mode}}
Duration: {{duration}}
```

### Quality Summary

| Metric | Value |
|--------|-------|
| Karpathy Compliance | {{compliance}}% |
| Quality Checks Passed | {{passed}}/{{total}} |
| Bugs Prevented | {{bugs_prevented}} |
| Code Review Findings | {{review_findings}} |
| TDD Cycles Completed | {{tdd_cycles}} |

### Cost Summary

| Metric | Value |
|--------|-------|
| Input Tokens | {{input_tokens}} |
| Output Tokens | {{output_tokens}} |
| Tokens Saved | {{tokens_saved}} |
| Cost Saved | ${{cost_saved}} |
| RTK Savings | {{rtk_savings}} tokens |
| Caveman Savings | {{caveman_savings}} tokens |
| Compact Savings | {{compact_savings}} tokens |
| Model Routing | {{model_decisions}} decisions |

### Integration Status

| Integration | Status | Impact |
|-------------|--------|--------|
| RTK | {{rtk_status}} | {{rtk_impact}} |
| Caveman | {{caveman_status}} | {{caveman_impact}} |
| CodeGraph | {{codegraph_status}} | {{codegraph_impact}} |
| Claude Mem | {{claude_mem_status}} | {{claude_mem_impact}} |

### Built-in Commands Used

| Command | Count | Savings |
|---------|-------|---------|
| /compact | {{compact_count}} | {{compact_savings}} tokens |
| /clear | {{clear_count}} | {{clear_savings}} tokens |
| /compress | {{compress_count}} | {{compress_savings}} tokens |

### Recommendations

{{recommendations}}

### Next Actions

1. /opt-mode - Adjust mode if needed
2. /opt-config - Tune integrations
3. /opt-dashboard - Live monitoring