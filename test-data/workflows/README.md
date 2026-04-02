# Test Workflows

Real n8n workflow JSON files used to validate the local app's parsing, rendering, and round-trip capabilities.

## Workflow Set: Prompt Graph Compiler & Executor

Four base workflows that compile a source prompt into an execution graph, then run it step-by-step using AI. W1 and W2 have LLM provider variants.

### Base Workflows

| File | Name | Nodes | LLM? | Description |
|------|------|-------|------|-------------|
| W0_Compile_Then_Run.json | W0_Compile_Then_Run | 5 | No | Orchestrator: calls W1 to compile, then W3 to run |
| W1_Compile_Source_Prompt.json | W1_Compile_Source_Prompt | 10 | OpenAI | AI compiler: LangChain + OpenAI + structured output + Data Table |
| W2_Execute_Step.json | W2_Execute_Step | 11 | OpenAI | Step executor: sub-workflow with AI + Data Table read/write |
| W3_Run_Compiled_Graph.json | W3_Run_Compiled_Graph | 12 | No | Graph runner: sequential loop calling W2 per step |

### LLM Provider Variants (W1)

| File | LLM Provider | Model |
|------|-------------|-------|
| W1_Compile_Source_Prompt.json | OpenAI | gpt-4o |
| W1_Compile_Source_Prompt_Gemini.json | Google Gemini | gemini-1.5-pro |
| W1_Compile_Source_Prompt_Claude.json | Anthropic Claude | claude-sonnet-4-20250514 |
| W1_Compile_Source_Prompt_Groq.json | Groq | llama-3.3-70b-versatile |

### LLM Provider Variants (W2)

| File | LLM Provider | Model |
|------|-------------|-------|
| W2_Execute_Step.json | OpenAI | gpt-4o |
| W2_Execute_Step_Gemini.json | Google Gemini | gemini-1.5-pro |
| W2_Execute_Step_Claude.json | Anthropic Claude | claude-sonnet-4-20250514 |
| W2_Execute_Step_Groq.json | Groq | llama-3.3-70b-versatile |

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
- `@n8n/n8n-nodes-langchain.lmChatGoogleGemini` (v1) — Google Gemini Chat Model
- `@n8n/n8n-nodes-langchain.lmChatAnthropic` (v1) — Anthropic Claude Chat Model
- `@n8n/n8n-nodes-langchain.lmChatGroq` (v1) — Groq Chat Model
- `@n8n/n8n-nodes-langchain.outputParserStructured` (v1.2) — Structured Output Parser

## Connection Types Covered

- `main` — standard data flow
- `ai_languageModel` — LangChain model → chain
- `ai_outputParser` — LangChain parser → chain

## Generating Variants

To regenerate the LLM variants from the base W1/W2 files:

```bash
npx tsx scripts/generate-llm-variants.ts
```

## Test Data

See `test-data/fixtures/` for sample prompts, step inputs, data table schemas, and API key templates.
