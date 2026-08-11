import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const root = process.cwd();
const yamlFiles = [
  'promptfooconfig.yaml',
  ...fs.readdirSync(path.join(root, 'configs')).filter((name) => name.endsWith('.yaml')).map((name) => `configs/${name}`),
  ...fs.readdirSync(path.join(root, 'datasets')).filter((name) => name.endsWith('.yaml')).map((name) => `datasets/${name}`),
  ...fs.readdirSync(path.join(root, '.github/workflows')).filter((name) => name.endsWith('.yml')).map((name) => `.github/workflows/${name}`),
];

const documents = new Map();
for (const relative of yamlFiles) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  try {
    documents.set(relative, parse(source));
  } catch (error) {
    throw new Error(`${relative}: ${error.message}`);
  }
}

const regressionCount = documents.get('datasets/regression-tests.yaml')?.length || 0;
const securityCount = documents.get('datasets/security-tests.yaml')?.length || 0;
const functionalCount = [
  'datasets/customer-support.yaml',
  'datasets/summarization.yaml',
  'datasets/regression-tests.yaml',
  'datasets/rag-tests.yaml',
  'datasets/structured-output.yaml',
].reduce((sum, file) => sum + (documents.get(file)?.length || 0), 0);

if (regressionCount < 15) throw new Error(`Regression suite has ${regressionCount}; expected at least 15.`);
if (securityCount < 20) throw new Error(`Security suite has ${securityCount}; expected at least 20.`);
if (functionalCount < 20) throw new Error(`Functional suites have ${functionalCount}; expected at least 20.`);

const allTextFiles = [];
for (const directory of ['configs', 'datasets', 'prompts', 'scripts', '.github/workflows']) {
  for (const name of fs.readdirSync(path.join(root, directory))) {
    const file = path.join(root, directory, name);
    if (fs.statSync(file).isFile()) allTextFiles.push(file);
  }
}
const secretPattern = /(sk-[A-Za-z0-9]{20,}|api[_-]?key\s*[:=]\s*['"][^'{\s][^'"]{12,})/i;
for (const file of allTextFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (secretPattern.test(source)) throw new Error(`Possible hard-coded secret in ${path.relative(root, file)}`);
}

console.log(`Project validation passed: ${functionalCount} functional examples, ${regressionCount} regression cases, ${securityCount} security cases.`);
