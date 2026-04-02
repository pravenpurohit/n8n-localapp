# Test Fixtures

Sample input data for exercising the test workflows with all LLM providers.

## Files

| File | Purpose |
|------|---------|
| `sample-prompts.json` | Source prompts to feed into W0/W1 for compilation |
| `sample-step-inputs.json` | Pre-built step inputs for W2 (bypasses W1 compilation) |
| `expected-data-tables.json` | Data table schemas needed by the workflows |
| `env-keys.example` | Template for LLM provider API keys |

## How to Use

1. Copy `env-keys.example` to your `.env` file and fill in API keys
2. Create the data tables listed in `expected-data-tables.json` in your n8n instance
3. Import any W1 variant and run it with a prompt from `sample-prompts.json`
4. Import W0 + W3 + a W2 variant for full end-to-end execution
