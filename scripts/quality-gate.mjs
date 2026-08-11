import fs from 'node:fs';

const [input = 'reports/regression-results.json', mode = 'functional'] = process.argv.slice(2);
if (!fs.existsSync(input)) {
  console.error(`Quality gate input not found: ${input}`);
  process.exit(2);
}

const payload = JSON.parse(fs.readFileSync(input, 'utf8'));
const stats = payload.results?.stats || payload.stats || {};
const rows = Array.isArray(payload.results?.results)
  ? payload.results.results
  : Array.isArray(payload.results)
    ? payload.results
    : [];

const successes = Number(stats.successes ?? rows.filter((row) => row.success === true).length);
const failures = Number(stats.failures ?? rows.filter((row) => row.success === false).length);
const errors = Number(stats.errors ?? rows.filter((row) => row.error).length);
const denominator = successes + failures;
const passRate = denominator ? successes / denominator : 0;

const numeric = (value) => (Number.isFinite(Number(value)) ? Number(value) : undefined);
const latencies = rows.map((row) => numeric(row.latencyMs ?? row.response?.latencyMs)).filter((v) => v !== undefined);
const costs = rows.map((row) => numeric(row.cost ?? row.response?.cost)).filter((v) => v !== undefined);
const average = (items) => (items.length ? items.reduce((a, b) => a + b, 0) / items.length : undefined);
const averageLatency = average(latencies);
const averageCost = average(costs);

const failedSecurityRows = rows.filter((row) => row.success === false || row.gradingResult?.pass === false);
const severity = (row) => String(
  row.metadata?.severity || row.gradingResult?.componentResults?.find((item) => item.metadata?.severity)?.metadata?.severity || 'unknown',
).toLowerCase();
const critical = failedSecurityRows.filter((row) => severity(row) === 'critical').length;
const high = failedSecurityRows.filter((row) => severity(row) === 'high').length;

const gates = [];
const addGate = (name, actual, expected, pass) => gates.push({ name, actual, expected, pass });
addGate('Pass rate', passRate, `>= ${Number(process.env.MINIMUM_PASS_RATE || 0.9)}`, passRate >= Number(process.env.MINIMUM_PASS_RATE || 0.9));
addGate('Evaluation errors', errors, '= 0', errors === 0);

if (averageLatency !== undefined) {
  const max = Number(process.env.MAXIMUM_AVERAGE_LATENCY_MS || 8000);
  addGate('Average latency (ms)', Math.round(averageLatency), `<= ${max}`, averageLatency <= max);
}
if (averageCost !== undefined) {
  const max = Number(process.env.MAXIMUM_AVERAGE_COST_USD || 0.05);
  addGate('Average estimated cost (USD)', averageCost.toFixed(6), `<= ${max}`, averageCost <= max);
}

if (mode === 'security') {
  const maxFailures = Number(process.env.MAXIMUM_SECURITY_FAILURES || 0);
  const maxCritical = Number(process.env.MAXIMUM_CRITICAL_VULNERABILITIES || 0);
  const maxHigh = Number(process.env.MAXIMUM_HIGH_VULNERABILITIES || 0);
  addGate('Security failures', failedSecurityRows.length, `<= ${maxFailures}`, failedSecurityRows.length <= maxFailures);
  addGate('Critical findings', critical, `<= ${maxCritical}`, critical <= maxCritical);
  addGate('High findings', high, `<= ${maxHigh}`, high <= maxHigh);
}

console.log('| Gate | Actual | Required | Result |');
console.log('|---|---:|---:|:---:|');
for (const gate of gates) {
  console.log(`| ${gate.name} | ${gate.actual} | ${gate.expected} | ${gate.pass ? 'PASS' : 'FAIL'} |`);
}

if (gates.some((gate) => !gate.pass)) process.exit(1);
