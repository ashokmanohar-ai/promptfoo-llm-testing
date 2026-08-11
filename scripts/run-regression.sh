#!/usr/bin/env bash
set -euo pipefail
npm run test:regression
npm run compare
npm run gate:functional
