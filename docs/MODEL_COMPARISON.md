# Model and parameter comparison

## Controlled experiments

A valid model comparison changes the provider/deployment while preserving the prompt, dataset, assertions, and model parameters as far as the providers allow.

`configs/model-comparison.yaml` uses two Azure deployment variables:

```dotenv
AZURE_OPENAI_DEPLOYMENT_MODEL_A=deployment-a
AZURE_OPENAI_DEPLOYMENT_MODEL_B=deployment-b
```

Run:

```bash
npm run test:models
node scripts/compare-results.mjs \
  reports/model-comparison-results.json \
  reports/model-comparison.md
```

## What to compare

| Dimension | Evidence |
|---|---|
| Correctness | Deterministic checks and reviewed judge metrics |
| Relevance | `llm-rubric` or calibrated relevance metric |
| Instruction following | Format, refusal, and policy assertions |
| Hallucination | Unsupported-claim and groundedness tests |
| Structured reliability | JSON parse and schema pass rate |
| Safety | Permanent security regressions and red-team findings |
| Latency | Real uncached calls, ideally including percentiles |
| Cost | Provider-reported usage/cost plus verified Azure pricing |
| Reliability | Errors, rate limits, and run-to-run consistency |

Select a production model from the overall tradeoff, not benchmark score alone.

## Parameter comparison

`configs/parameter-comparison.yaml` compares temperature `0` and `0.7` using the same deployment, prompt, and summarization dataset.

```bash
npm run test:parameters
```

Use the same pattern for max tokens, system prompt, response format, retrieval settings, reasoning effort, or other provider-supported settings. Change one factor at a time unless you intentionally run a factorial experiment.

## Matrix size and budget

Three prompts × two models × fifty tests creates 300 generation cases before judge or embedding calls. Repeats, multiple assertions, and red-team attack generation increase that total.

Before a large run:

1. estimate generation and grading calls;
2. cap concurrency to respect Azure quotas;
3. start with a representative smoke subset;
4. cache non-latency development runs;
5. disable cache for latency measurement;
6. set a run budget and artifact-retention policy.

## Cost caveats

Promptfoo's `cost` assertion requires provider cost metadata. Azure pricing recognition varies by deployment/model name and changes over time. An absent cost is unknown, not zero. Validate reported values against Azure billing and include non-model costs such as retrieval, reranking, observability, and human review in production decisions.

## Latency caveats

Average latency hides tail behavior. Promptfoo's per-call latency is useful for controlled comparison, but production selection should also measure p50, p95, p99, rate-limit behavior, concurrency, streaming time-to-first-token, retries, and regional network effects.

