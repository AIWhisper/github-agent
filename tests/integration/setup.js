require('dotenv').config();

const TEST_TIMEOUT = 30000; // 30 seconds
const CLEANUP_TIMEOUT = 10000; // 10 seconds

// Increase timeout for all integration tests
jest.setTimeout(TEST_TIMEOUT);

// Test environment validation
if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN environment variable is required for integration tests');
}

// Generate unique test identifiers
const getTestIdentifier = () => {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(7);
  return `test-${timestamp}-${random}`;
};

// Cleanup helper
const cleanupRepository = async (github, owner, repo) => {
  try {
    await github.deleteRepository({ owner, repo });
  } catch (error) {
    console.warn(`Failed to cleanup repository ${owner}/${repo}:`, error.message);
  }
};

module.exports = {
  TEST_TIMEOUT,
  CLEANUP_TIMEOUT,
  getTestIdentifier,
  cleanupRepository,
};