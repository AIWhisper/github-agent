const assert = require('assert');
const GitHubService = require('../github-service');

describe('GitHubService Retry Mechanism', () => {
  let github;

  beforeEach(() => {
    github = new GitHubService();
  });

  describe('retryOperation', () => {
    it('should succeed on first attempt if no error', async () => {
      let attempts = 0;
      const result = await github.retryOperation(async () => {
        attempts++;
        return 'success';
      }, 'test operation');

      assert.strictEqual(result, 'success');
      assert.strictEqual(attempts, 1);
    });

    it('should retry on rate limit', async () => {
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
});