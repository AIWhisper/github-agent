module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.integration.test.js'],
  globalSetup: './tests/integration/setup.js',
  globalTeardown: './tests/integration/teardown.js',
  setupFiles: ['dotenv/config'],
  testTimeout: 30000, // Longer timeout for integration tests
  collectCoverage: false, // Typically don't need coverage for integration tests
  verbose: true
};
