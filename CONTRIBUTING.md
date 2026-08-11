# Contributing

## Change workflow

1. Create a focused branch.
2. Add or update the prompt/application code.
3. Add a test that expresses the intended behavior.
4. Run `npm run validate` and `npm run test:unit`.
5. Run the smallest relevant Promptfoo suite, then full regression/security suites.
6. Review generated reports for sensitive content before sharing.
7. Commit the prompt and its tests together.

## Adding a golden case

Use a stable ID, a clear description, sanitized inputs, explicit metadata, deterministic assertions where possible, and a calibrated judge only when needed. Production defects must be stripped of customer identifiers and secrets.

## Changing Promptfoo versions

Do not replace the pinned version with `latest` in committed automation. Review official release notes and migration guidance, update the package and lockfile intentionally, validate every config, and rerun representative functional and security suites.

## Security

Do not open a public issue containing credentials, private data, exploit details against a real target, or sensitive Promptfoo reports. Follow responsible disclosure and the owning organization's incident process.
