import 'dotenv/config';

const required = [
  'AZURE_OPENAI_API_KEY',
  'AZURE_OPENAI_API_VERSION',
  'AZURE_OPENAI_DEPLOYMENT_NAME',
];

if (!process.env.AZURE_OPENAI_API_HOST && process.env.AZURE_OPENAI_ENDPOINT) {
  try {
    process.env.AZURE_OPENAI_API_HOST = new URL(process.env.AZURE_OPENAI_ENDPOINT).host;
  } catch {
    process.env.AZURE_OPENAI_API_HOST = process.env.AZURE_OPENAI_ENDPOINT
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');
  }
}

required.push('AZURE_OPENAI_API_HOST');
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and provide your Azure OpenAI values.');
  process.exit(2);
}

// Promptfoo's documented native names are set in this child process only.
process.env.AZURE_API_KEY ||= process.env.AZURE_OPENAI_API_KEY;
process.env.AZURE_API_HOST ||= process.env.AZURE_OPENAI_API_HOST;
process.env.AZURE_DEPLOYMENT_NAME ||= process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
process.env.AZURE_OPENAI_JUDGE_DEPLOYMENT_NAME ||= process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

console.log('Azure OpenAI preflight passed. Secret values were not printed.');
