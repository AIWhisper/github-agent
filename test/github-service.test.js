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

    it('should retry on rate limit and respect reset time', async () => {
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

    it('should implement exponential backoff', async () => {
      const error = new Error('Temporary error');
      const startTime = Date.now();
      let attempts = 0;

      try {
        await github.retryOperation(async () => {
          attempts++;
          throw error;
        }, 'test operation');
      } catch (e) {
        const duration = Date.now() - startTime;
        assert.strictEqual(attempts, github.config.maxRetries);
        // Should take at least: 1000 + 2000 + 4000 = 7000ms
        assert.ok(duration >= 7000);
      }
    });

    it('should preserve error context', async () => {
      try {
        await github.retryOperation(async () => {
          throw new Error('Custom error');
        }, 'test operation');
        assert.fail('Should have thrown');
      } catch (error) {
        assert.ok(error.message.includes('Custom error'));
        assert.ok(error.message.includes('test operation'));
      }
    });
  });

  describe('setRetryOptions', () => {
    it('should update retry configuration', () => {
      const result = github.setRetryOptions(5, 2000);
      assert.strictEqual(result.success, true);
      assert.strictEqual(github.config.maxRetries, 5);
      assert.strictEqual(github.config.retryDelay, 2000);
    });

    it('should validate retry values', () => {
      const result = github.setRetryOptions(-1, 1000);
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('must be a positive number'));
    });
  });

  describe('writeFile with retries', () => {
    it('should handle transient errors', async () => {
      let attempts = 0;
      // Replace window.push_files temporarily
      const original = window.push_files;
      window.push_files = async () => {
        attempts++;
        if (attempts === 1) throw { status: 500, message: 'Temporary error' };
        return { success: true };
      };

      const result = await github.writeFile('test.txt', 'content');
      
      // Restore original
      window.push_files = original;

      assert.strictEqual(result.success, true);
      assert.strictEqual(attempts, 2);
    });
  });
});