module.exports = {
  displayName: 'integration',
  testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.js'],
  testTimeout: 30000,
};