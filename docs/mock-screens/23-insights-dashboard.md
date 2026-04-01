# Screen 23: Insights Dashboard

## Phase: 2 (Enterprise/Paid — Insights dashboard requires Pro/Business/Enterprise)

## Description
Analytics dashboard showing execution metrics, failure rates, time saved, and per-workflow performance data.

## ASCII Wireframe

```
┌──────┬──────────────────────────────────────────────────────────┐
│      │  Insights                               🔒 Enterprise    │
│  n8n │                                                         │
│ ──── │  Time Period: [7 days ▼]                                │
│      │                                                         │
│ Insi │  ┌─ Summary Banner ───────────────────────────────┐     │
│ ghts │  │                                                │     │
│      │  │  Total Executions    Failed    Failure Rate    │     │
│      │  │     1,234            23         1.9%           │     │
│      │  │     ↑ 12%            ↓ 5%      ↓ 0.3%         │     │
│      │  │                                                │     │
│      │  │  Time Saved          Avg Run Time              │     │
│      │  │     42.5 hours       2.3 seconds               │     │
│      │  │     ↑ 8%             ↓ 0.1s                    │     │
│      │  │                                                │     │
│      │  └────────────────────────────────────────────────┘     │
│      │                                                         │
│      │  ┌─ Execution Trend Chart ────────────────────────┐     │
│      │  │     ▁▂▃▅▇█▇▅▃▂▁▂▃▅▇█▇▅▃▂▁▂▃▅▇                │     │
│      │  │  Mon Tue Wed Thu Fri Sat Sun                   │     │
│      │  └────────────────────────────────────────────────┘     │
│      │                                                         │
│      │  ┌─ Per-Workflow Metrics ─────────────────────────┐     │
│      │  │  Workflow      Executions  Failed  Rate  Avg   │     │
│      │  ├────────────────────────────────────────────────┤     │
│      │  │  Email Notify  456         2       0.4%  1.2s  │     │
│      │  │  Data Sync     312         15      4.8%  3.4s  │     │
│      │  │  Slack Bot     234         1       0.4%  0.8s  │     │
│      │  │  Report Gen    123         5       4.1%  5.2s  │     │
│      │  └────────────────────────────────────────────────┘     │
└──────┴──────────────────────────────────────────────────────────┘
```

## n8n.com Comparison
- Matches n8n's Insights page layout
- Same summary banner with 5 key metrics
- Same comparison arrows (↑↓) vs previous period
- Same per-workflow metrics table
- Same time period selector
- Requires Pro plan minimum on n8n.com
