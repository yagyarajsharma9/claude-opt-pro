---
description: View quality and cost optimization dashboard
---

## Dashboard

Run `/opt-dashboard` to view current metrics.

### Quality Metrics

- **Karpathy Compliance:** Percentage of Karpathy principles followed
- **Quality Checks:** Passed/total checks
- **Bug Rate:** Estimated reduction from quality practices
- **Test Coverage:** Current coverage percentage
- **Quality Gates:** Status of pre-commit and code review gates

### Cost Metrics

- **Tokens Saved:** Total tokens saved this session
- **Cost Saved:** Estimated dollar savings
- **RTK Savings:** Tokens saved by RTK compression
- **Caveman Savings:** Tokens saved by output compression
- **Compact Savings:** Tokens saved by session compaction
- **Model Routing:** Number of model routing decisions

### Combined Metrics

- **Quality-Adjusted Cost:** Cost savings adjusted for quality impact
- **ROI:** Return on investment from optimization
- **Session Efficiency:** Quality per token ratio

### Current Configuration

```
Mode: {{mode}}
Quality Engine: {{quality_enabled}}
Cost Engine: {{cost_enabled}}
RTK: {{rtk_status}}
Caveman: {{caveman_mode}}
CodeGraph: {{codegraph_status}}
Claude Mem: {{claude_mem_status}}
```

### Recent Suggestions

{{suggestions}}

### Recommendations

{{recommendations}}