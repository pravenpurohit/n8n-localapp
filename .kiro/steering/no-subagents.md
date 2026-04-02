---
inclusion: always
---

# No Sub-Agent Delegation

Do NOT use `invokeSubAgent` for any task execution, spec creation, or code implementation. Always do the work directly yourself using the available tools (fsWrite, fsAppend, strReplace, executeBash, readFile, readCode, etc.).

This applies to:
- Spec workflow phases (requirements, design, tasks)
- Task execution from tasks.md
- Code writing, testing, and debugging
- Any other work

Reason: Sub-agent delegation causes token exhaustion, recursion limits, and context loss on large projects. Direct execution is more reliable and faster.
