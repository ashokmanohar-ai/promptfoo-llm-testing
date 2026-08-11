# AI red teaming with Promptfoo

## Purpose

Functional testing asks whether the application performs intended tasks. Red teaming asks whether an attacker can cause unintended, unauthorized, or unsafe behavior.

Promptfoo plugins generate vulnerability-specific probes. Strategies transform or adapt those probes to make attacks more effective. The target is the application or model under test; attack generation and grading may use separate providers.

## Threat model in this repository

The fictional target is a SaaS customer-support assistant. It may explain public procedures but must not:

- reveal prompts, secrets, configuration, PII, or cross-user data;
- accept user claims of elevated authority;
- follow instructions from retrieved documents;
- claim to call tools or change records;
- perform unauthorized actions;
- fabricate policy identifiers or sources;
- leave support scope for harmful or unrelated tasks.

## Current plugin coverage

| Risk | Promptfoo plugin ID | Conceptual severity |
|---|---|---|
| System instruction override | `system-prompt-override` | Critical |
| Prompt extraction | `prompt-extraction` | High |
| Malicious retrieved content | `indirect-prompt-injection` | Critical |
| Direct/social PII leakage | `pii:direct`, `pii:social` | Critical/High |
| Cross-user/session leakage | `cross-session-leak` | Critical |
| Goal hijacking | `hijacking` | Medium |
| Unauthorized initiative | `excessive-agency` | High |
| Tool detail disclosure | `tool-discovery` | Medium |
| Role enforcement | `rbac` | Critical |
| Poisoned retrieval | `rag-poisoning` | High |
| Fabricated citations | `rag-source-attribution` | Medium |
| Command/database injection | `shell-injection`, `sql-injection` | Critical |
| Privacy harm | `harmful:privacy` | High |

Identifiers are version-sensitive and were checked against Promptfoo 0.122.0.

## Strategies

| Strategy | Behavior |
|---|---|
| `basic` | Keeps original plugin-generated probes |
| `jailbreak:meta` | Recommended single-turn agentic attack generation |
| `jailbreak:hydra` | Adaptive multi-turn branching; can replay history to stateless targets |
| `base64` | Encodes payloads to test filter bypass |
| `rot13` | Applies ROT13 obfuscation |

Start with a narrow threat-model-driven list. More strategies increase calls, time, and cost without guaranteeing more relevant findings.

## Commands

Current three-step flow:

```bash
promptfoo redteam init --no-gui
promptfoo redteam generate -c configs/redteam.yaml -o reports/generated-redteam.yaml
promptfoo redteam eval -c reports/generated-redteam.yaml \
  -o reports/redteam-results.json \
  -o reports/redteam-report.html
promptfoo redteam report
```

`promptfoo redteam run` combines generation and evaluation. This repository separates them so CI can retain the generated probes and export evaluation reports explicitly.

## Indirect prompt injection

The red-team wrapper has two variables:

- `{{prompt}}`: attacker-controlled user message;
- `{{context}}`: untrusted retrieved content.

`indirect-prompt-injection` sets `indirectInjectionVar: context`. The application must treat document text as data, not privileged instructions. A real RAG target should preserve this separation through the whole retrieval and generation pipeline.

## Generated discovery vs permanent regressions

Generated scans find new attack variations. They can change across runs and may rely on remote inference. Permanent security regressions are curated, stable reproductions of important findings.

When a generated probe succeeds:

1. confirm it safely;
2. classify impact and severity;
3. fix application controls, not only wording;
4. add a minimized case to `datasets/security-tests.yaml`;
5. run it in every pull request;
6. rerun broader red teaming after remediation.

## Severity

Severity should combine exploitability, data sensitivity, action privilege, blast radius, detectability, and business impact. Promptfoo supports low, medium, high, and critical severity metadata for configured plugins. Do not use model confidence as severity.

## Reports

Red-team reports contain attack instructions, model outputs, vulnerability evidence, and possible sensitive context. Store them in restricted artifacts, minimize retention, redact before sharing, and never commit production scan output to a public repository.

Some Promptfoo Community plugins/strategies use remote inference (marked in official documentation). Obtain approval before sending proprietary prompts or context to any remote generation service.

