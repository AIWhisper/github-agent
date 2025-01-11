// Test suite for GitHub service error handling
const assert = require('assert');
const GitHubService = require('../github-service');

describe('GitHubService Error Handling', () => {
  let github;

  beforeEach(() => {
    github = new GitHubService();
  });

  describe('Parameter Validation', () => {
    it('should validate required parameters', async () => {
      const result = await github.writeFile(null, null);
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('Missing required parameters'));
    });

    it('should validate retry options', () => {
      const result = github.setRetryOptions(-1, 1000);
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('must be a positive number'));
    });
  });

  describe('Retry Logic', () => {
    it('should retry on rate limit', async () => {
      // Mock rate limit response
      const rateLimitError = {
        status: 429,
        headers: {
          'x-ratelimit-reset': (Date.now() / 1000 + 1).toString()
        }
      };

      let attempts = 0;
      const result = await github.retryOperation(async () => {
        attempts++;
        if (attempts === 1) throw rateLimitError;
        return 'success';
      }, 'test operation');

      assert.strictEqual(result, 'success');
      assert.strictEqual(attempts, 2);
    });
  });

  describe('Error Context', () => {
    it('should include operation context in errors', async () => {
      const result = await github.readFile('nonexistent.txt');
      assert.strictEqual(result.success, false);
      assert.ok(result.context.operation === 'readFile');
      assert.ok(result.context.path === 'nonexistent.txt');
      assert.ok(result.context.timestamp);
    });
  });
});
