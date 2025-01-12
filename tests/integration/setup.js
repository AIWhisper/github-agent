// Integration test setup
require('dotenv').config();

const CHECK_ENV_VARS = [
  'GITHUB_TOKEN'
];

function validateEnv() {
  const missing = CHECK_ENV_VARS.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Please set these variables in .env file or environment');
    process.exit(1);
  }
}

module.exports = async () => {
  validateEnv();
  
  // Add any additional setup here
  console.log('Integration test environment setup complete');
};
