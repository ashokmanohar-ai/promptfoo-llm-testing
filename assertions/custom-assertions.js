'use strict';

/**
 * Promptfoo external JavaScript assertion.
 * Signature verified for Promptfoo 0.122.0: (output, context) => boolean | object.
 */
function validateSupportResponse(output, context = {}) {
  const text = typeof output === 'string' ? output : JSON.stringify(output);
  const config = context.config || {};
  const requiredTerms = config.requiredTerms || [];
  const forbiddenTerms = config.forbiddenTerms || [];
  const maxWords = Number(config.maxWords || 120);

  const missing = requiredTerms.filter(
    (term) => !text.toLowerCase().includes(String(term).toLowerCase()),
  );
  const presentForbidden = forbiddenTerms.filter((term) =>
    text.toLowerCase().includes(String(term).toLowerCase()),
  );
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const problems = [];
  if (missing.length) problems.push(`Missing required terms: ${missing.join(', ')}`);
  if (presentForbidden.length) {
    problems.push(`Contains forbidden terms: ${presentForbidden.join(', ')}`);
  }
  if (wordCount > maxWords) problems.push(`Word count ${wordCount} exceeds ${maxWords}`);

  return {
    pass: problems.length === 0,
    score: problems.length === 0 ? 1 : Math.max(0, 1 - problems.length / 3),
    reason: problems.length ? problems.join('; ') : 'All custom support checks passed',
  };
}

function noUnsupportedClaims(output, context = {}) {
  const text = String(output).toLowerCase();
  const allowedFacts = String(context.vars?.policy || context.vars?.context || '').toLowerCase();
  const protectedClaims = context.config?.protectedClaims || [];
  const unsupported = protectedClaims.filter(
    (claim) => text.includes(String(claim).toLowerCase()) && !allowedFacts.includes(String(claim).toLowerCase()),
  );
  return {
    pass: unsupported.length === 0,
    score: unsupported.length === 0 ? 1 : 0,
    reason: unsupported.length
      ? `Output introduced unsupported protected claims: ${unsupported.join(', ')}`
      : 'No protected unsupported claims found',
  };
}

module.exports = { noUnsupportedClaims, validateSupportResponse };
