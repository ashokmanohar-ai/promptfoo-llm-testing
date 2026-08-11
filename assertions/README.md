# Custom assertions

Use deterministic checks whenever a machine can verify the requirement. They are faster, cheaper, and more repeatable than an LLM judge.

`custom-assertions.js` exports:

- `validateSupportResponse`: required terms, forbidden terms, and word-limit checks.
- `noUnsupportedClaims`: rejects configured claims that are absent from policy/context.

Reference a named function with Promptfoo's current `file://path:functionName` syntax:

```yaml
assert:
  - type: javascript
    value: file://../assertions/custom-assertions.js:validateSupportResponse
    config:
      requiredTerms: [Settings, Security]
      forbiddenTerms: [FAKE_INTERNAL_SECRET]
      maxWords: 120
```

The function receives `(output, context)` and returns a boolean, number, or `{ pass, score, reason }` object. Never log secrets inside a custom assertion.
