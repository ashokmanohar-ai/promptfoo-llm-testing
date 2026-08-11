#!/usr/bin/env bash
set -euo pipefail
npm run validate
npm run test:unit
npm run test:regression
npm run gate:functional
npm run test:structured
npm run test:security-regression
npm run gate:security
