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

      it('should validate number ranges', () => {
        const params = { age: 15 };
        const schema = { age: { type: 'number', min: 18, max: 100 } };
        
        const errors = github.validateParams(params, schema);
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], 'age must be greater than or equal to 18');
      });

      it('should validate string lengths', () => {
        const params = { name: 'a' };
        const schema = { name: { type: 'string', minLength: 2, maxLength: 50 } };
        
        const errors = github.validateParams(params, schema);
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], 'name must have a minimum length of 2');
      });

      it('should pass validation when all rules are satisfied', () => {
        const params = {
          name: 'test-file.txt',
          content: 'Hello World',
          count: 5
        };
        const schema = {
          name: { type: 'string', pattern: /^[a-zA-Z0-9\-_/.]+$/ },
          content: { type: 'string', required: true },
          count: { type: 'number', min: 1, max: 10 }
        };
        
        const errors = github.validateParams(params, schema);
        assert.strictEqual(errors.length, 0);
      });
    });

    describe('writeFile', () => {
      it('should validate file path format', async () => {
        const result = await github.writeFile('invalid@path', 'content');
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.error, 'Parameter validation failed');
        assert.ok(result.details.some(error => error.includes('path')));
      });

      it('should require content', async () => {
        const result = await github.writeFile('test.txt', null);
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.error, 'Parameter validation failed');
        assert.ok(result.details.some(error => error.includes('content is required')));
      });

      it('should validate commit message if provided', async () => {
        const result = await github.writeFile('test.txt', 'content', '');
        assert.strictEqual(result.success, false);
        assert.strictEqual(result.error, 'Parameter validation failed');
        assert.ok(result.details.some(error => error.includes('message must have a minimum length')));
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
        // Should take at least: 1000 + 2000 + 4000 = 7000ms
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