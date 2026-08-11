# Generated reports

Promptfoo writes real run artifacts here. The scripts export JSON for automation and HTML/CSV where useful for human review.

Nothing in this directory is a fabricated benchmark. Run an evaluation with your configured Azure deployments to create results:

```bash
npm run test:regression
npm run compare
```

Generated output is ignored by Git because prompts, model outputs, and red-team findings can contain sensitive data. In CI, upload reports as restricted workflow artifacts with short retention. Inspect every file before sharing it.
