const assert = require('assert');
const GitHubService = require('../github-service');

describe('GitHubService', () => {
  let github;

  beforeEach(() => {
    github = new GitHubService();
  });

  describe('Parameter Validation', () => {
    describe('validateParams', () => {
      it('should validate required fields', () => {
        const params = { name: undefined };
        const schema = { name: { required: true } };
        
        const errors = github.validateParams(params, schema);
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], 'name is required');
      });

      it('should validate types', () => {
        const params = { count: 'not-a-number' };
        const schema = { count: { type: 'number' } };
        
        const errors = github.validateParams(params, schema);
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], 'count must be of type number');
      });

      it('should validate patterns', () => {
        const params = { filename: 'invalid@file' };
        const schema = { filename: { pattern: /^[a-zA-Z0-9\-_/.]+$/ } };
        
        const errors = github.validateParams(params, schema);
        assert.strictEqual(errors.length, 1);
        assert.ok(errors[0].includes('must match pattern'));
      });
    });
  });

  describe('Pull Request Operations', () => {
    describe('mergePullRequest', () => {
      it('should validate PR number', async () => {
        const result = await github.mergePullRequest(-1);
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.error, 'Parameter validation failed');
        assert.ok(result.details.some(error => error.includes('prNumber must be greater than or equal to 1')));
      });

      it('should validate merge method', async () => {
        const result = await github.mergePullRequest(1, 'invalid-method');
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.error, 'Parameter validation failed');
        assert.ok(result.details.some(error => error.includes('mergeMethod must match pattern')));
      });

      it('should handle non-existent PRs', async () => {
        // Mock the API response for a non-existent PR
        global.window = {
          get_issue: async () => {
            throw new Error('Not found');
          }
        };

        const result = await github.mergePullRequest(999);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('Not found'));
      });

      it('should handle merge conflicts', async () => {
        // Mock the API response for a PR with conflicts
        global.window = {
          get_issue: async () => ({ pull_request: {} }),
          merge_pull_request: async () => {
            throw new Error('Merge conflict');
          }
        };

        const result = await github.mergePullRequest(1);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('Merge conflict'));
      });

      it('should successfully merge PR', async () => {
        // Mock successful PR merge
        global.window = {
          get_issue: async () => ({ pull_request: {} }),
          merge_pull_request: async () => ({
            sha: 'merged-commit-sha'
          })
        };

        const result = await github.mergePullRequest(1);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.mergeCommitSha, 'merged-commit-sha');
      });
    });
  });

  describe('Retry Mechanism', () => {
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
        assert.ok(duration >= 7000);
      }
    });
  });

  describe('setRetryOptions', () => {
    it('should validate retry options', () => {
      const result = github.setRetryOptions(-1, 1000);
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, 'Parameter validation failed');
      assert.ok(result.details.some(error => error.includes('must be greater than or equal to 1')));
    });

    it('should update retry configuration when valid', () => {
      const result = github.setRetryOptions(5, 2000);
      assert.strictEqual(result.success, true);
      assert.strictEqual(github.config.maxRetries, 5);
      assert.strictEqual(github.config.retryDelay, 2000);
    });
  });
});