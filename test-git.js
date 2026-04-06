const { execSync } = require('child_process');

try {
  const output = execSync('git --version', { encoding: 'utf-8' });
  console.log('Success:', output);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
