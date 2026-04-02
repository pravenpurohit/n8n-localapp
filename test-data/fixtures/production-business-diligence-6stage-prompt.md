# Production Business Due Diligence — 6-Stage Prompt Chain with Diamond Dependencies

Source: Real-world 6-stage prompt chain with explicit pass-through payloads,
multi-input fan-in, and a terminal recombination prompt.

## Why This Is a Unique Stress Test

- 6 stages + 1 recombination = 7 total prompts (vs. 4 in the simpler version)
- Diamond dependency: Prompt 5 requires outputs from Prompts 1, 3, AND 4 simultaneously
- Explicit pass-through payload specs ("copy VERBATIM") — tests data forwarding vs. processing
- Execution mode hints ("use Deep Research mode for prompts 1, 3, 4")
- 28-point diligence for Top 7 (not just Top 3)
- Scoring weight calibration with HIGH/MODERATE/LOW tiers
- Terminal recombination with strict "do not regenerate" instruction

## Dependency Graph

```
P1 ──→ P2 ──→ P3 ──→ P4 ──→ P5 ──→ P6 ──→ Recombine
 │                │         │
 └────────────────┴─────────┘
       (P5 needs P1 + P3 + P4)
```

This diamond pattern is the key differentiator from the 4-stage version.
