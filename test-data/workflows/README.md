# Test Workflows

These are real n8n workflow JSON files used to validate the local app's parsing, rendering, and round-trip capabilities.

## Workflow Set: Prompt Graph Compiler & Executor

Four interconnected workflows that compile a source prompt into an execution graph, then run it step-by-step using AI.

| File | Name | Nodes | Description |
|------|------|-------|-------------|
| W0_Compile_Then_Run.json | W0_Compile_Then_Run | 5 | Orchestrator: calls W1 to compile, then W3 to run |
| W1_Compile_Source_Prompt.json | W1_Compile_Source_Prompt | 10 | AI compiler: LangChain + OpenAI + structured output + Data Table |
| W2_Execute_Step.json | W2_Execute_Step | 11 | Step executor: sub-workflow with AI + Data Table read/write |
| W3_Run_Compiled_Graph.json | W3_Run_Compiled_Graph | 12 | Graph runner: sequential loop calling W2 per step |

## Node Types Covered

- `manualTrigger` (v1)
- `executeWorkflowTrigger` (v1.1)
- `set` (v3.4)
- `code` (v2) — JavaScript
- `executeWorkflow` (v1.2) — sub-workflow calls
- `splitInBatches` (v3) — loop construct
- `n8nDataTable` (v1) — Data Table read/upsert
- `@n8n/n8n-nodes-langchain.chainLlm` (v1.4) — LangChain Chain LLM
- `@n8n/n8n-nodes-langchain.lmChatOpenAi` (v1) — OpenAI Chat Model
- `@n8n/n8n-nodes-langchain.outputParserStructured` (v1.2) — Structured Output Parser

## Connection Types Covered

- `main` — standard data flow
- `ai_languageModel` — LangChain model → chain
- `ai_outputParser` — LangChain parser → chain

## Data Tables Referenced

- `compiled_graphs` — stores compiled prompt graph manifests
- `step_results` — stores individual step execution results
- `run_results` — stores overall run status and final output

## Sub-Workflow References

W0 references W1 and W3 via `REPLACE_WITH_W1_WORKFLOW_ID` / `REPLACE_WITH_W3_WORKFLOW_ID` placeholders.
W3 references W2 via `REPLACE_WITH_W2_WORKFLOW_ID`.
