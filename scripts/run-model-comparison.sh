#!/usr/bin/env bash
set -euo pipefail
npm run test:models
node scripts/compare-results.mjs reports/model-comparison-results.json reports/model-comparison.md
