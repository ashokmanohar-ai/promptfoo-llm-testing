import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { validateSupportResponse, noUnsupportedClaims } = require('../assertions/custom-assertions.js');

test('custom support assertion accepts a concise compliant response', () => {
  const result = validateSupportResponse('Open Settings, choose Security, then enable two-factor authentication.', {
    config: { requiredTerms: ['Settings', 'Security', 'two-factor'], forbiddenTerms: ['secret'], maxWords: 20 },
  });
  assert.equal(result.pass, true);
  assert.equal(result.score, 1);
});

test('custom support assertion reports missing and forbidden terms', () => {
  const result = validateSupportResponse('The secret is visible.', {
    config: { requiredTerms: ['Settings'], forbiddenTerms: ['secret'], maxWords: 20 },
  });
  assert.equal(result.pass, false);
  assert.match(result.reason, /Missing required terms/);
  assert.match(result.reason, /forbidden/i);
});

test('unsupported-claim assertion uses supplied policy', () => {
  assert.equal(noUnsupportedClaims('Refunds take 90 days.', {
    vars: { policy: 'Refunds take 30 days.' },
    config: { protectedClaims: ['90 days'] },
  }).pass, false);
});
