import fs from 'node:fs';

const [input = 'reports/regression-results.json', output = 'reports/regression-comparison.md'] = process.argv.slice(2);
const payload = JSON.parse(fs.readFileSync(input, 'utf8'));
const rows = payload.results?.results || payload.results || [];
if (!Array.isArray(rows) || !rows.length) throw new Error('No Promptfoo result rows found.');

const groups = new Map();
for (const row of rows) {
  const prompt = row.prompt?.label || row.prompt?.display || row.prompt?.raw || row.promptId || 'unknown-prompt';
  const provider = row.provider?.label || row.provider?.id || row.provider || 'unknown-provider';
  const key = `${prompt} / ${provider}`;
  const group = groups.get(key) || { total: 0, passed: 0, score: 0, latency: [], cost: 0, costRows: 0 };
  group.total += 1;
  group.passed += row.success === true || row.gradingResult?.pass === true ? 1 : 0;
  group.score += Number(row.score ?? row.gradingResult?.score ?? 0);
  if (Number.isFinite(Number(row.latencyMs))) group.latency.push(Number(row.latencyMs));
  if (Number.isFinite(Number(row.cost))) {
    group.cost += Number(row.cost);
    group.costRows += 1;
  }
  groups.set(key, group);
}

const lines = [
  '# Actual Promptfoo comparison',
  '',
  '> Generated from a real Promptfoo JSON result. No metric values are hard-coded.',
  '',
  '| Prompt / Provider | Cases | Pass rate | Average score | Average latency | Average estimated cost |',
  '|---|---:|---:|---:|---:|---:|',
];
for (const [name, group] of groups) {
  const latency = group.latency.length
    ? `${Math.round(group.latency.reduce((a, b) => a + b, 0) / group.latency.length)} ms`
    : 'not reported';
  const cost = group.costRows ? `$${(group.cost / group.costRows).toFixed(6)}` : 'not reported';
  lines.push(`| ${name.replaceAll('|', '\\|')} | ${group.total} | ${((group.passed / group.total) * 100).toFixed(1)}% | ${(group.score / group.total).toFixed(3)} | ${latency} | ${cost} |`);
}
lines.push('', 'Review individual failures even when the aggregate candidate score improves.');
fs.writeFileSync(output, `${lines.join('\n')}\n`);
console.log(`Wrote comparison to ${output}`);
