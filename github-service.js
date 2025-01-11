class GitHubService {
  constructor() {
    this.config = {
      owner: 'AIWhisper',
      repo: 'github-agent',
      branch: 'main',
      maxRetries: 3,
      retryDelay: 1000  // Base delay in ms
    };
  }

  // Parameter validation utility
  validateParams(params, schema) {
    const errors = [];
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = params[key];
      
      // Required check
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${key} is required`);
        continue;
      }
      
      // Skip other validations if value is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }
      
      // Type check
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${key} must be of type ${rules.type}`);
      }
      
      // Pattern check
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${key} must match pattern ${rules.pattern}`);
      }
      
      // Min/Max check for numbers
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${key} must be greater than or equal to ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${key} must be less than or equal to ${rules.max}`);
        }
      }
      
      // Length check for strings and arrays
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`${key} must have a minimum length of ${rules.minLength}`);
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`${key} must have a maximum length of ${rules.maxLength}`);
      }
    }
    
    return errors;
  }

  // Core retry mechanism with exponential backoff
  async retryOperation(operation, context) {
    let attempts = 0;
    let lastError = null;

    while (attempts < this.config.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Special handling for rate limits
        if (error.status === 429) {
          const resetTime = error.headers?.['x-ratelimit-reset'];
          if (resetTime) {
            const waitTime = (new Date(resetTime * 1000) - new Date()) + 1000;
            await this.delay(waitTime);
            continue;
          }
        }

        // Exponential backoff for other errors
        const waitTime = this.config.retryDelay * Math.pow(2, attempts);
        await this.delay(waitTime);
        attempts++;

        if (attempts === this.config.maxRetries) {
          throw new Error(`Operation failed after ${attempts} attempts: ${error.message}`);
        }
      }
    }
    throw lastError;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Basic file operation with retry and parameter validation
  async writeFile(path, content, message = null) {
    // Validate parameters
    const errors = this.validateParams({
      path,
      content,
      message
    }, {
      path: {
        required: true,
        type: 'string',
        minLength: 1,
        pattern: /^[a-zA-Z0-9\-_/.]+$/
      },
      content: {
        required: true,
        type: 'string'
      },
      message: {
        type: 'string',
        minLength: 1
      }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: 'Parameter validation failed',
        details: errors,
        context: {
          operation: 'writeFile',
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      return await this.retryOperation(async () => {
        await window.push_files({
          owner: this.config.owner,
          repo: this.config.repo,
          branch: this.config.branch,
          files: [{
            path: path,
            content: content
          }],
          message: message || `Update ${path} via GitHub agent`
        });

        return {
          success: true,
          data: `Successfully updated ${path}`
        };
      }, `writing file ${path}`);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        context: {
          operation: 'writeFile',
          path,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Configuration method for retry options with validation
  setRetryOptions(maxRetries, retryDelay) {
    const errors = this.validateParams({
      maxRetries,
      retryDelay
    }, {
      maxRetries: {
        type: 'number',
        min: 1
      },
      retryDelay: {
        type: 'number',
        min: 0
      }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: 'Parameter validation failed',
        details: errors
      };
    }

    if (maxRetries) {
      this.config.maxRetries = maxRetries;
    }
    if (retryDelay) {
      this.config.retryDelay = retryDelay;
    }
    
    return {
      success: true,
      data: {
        maxRetries: this.config.maxRetries,
        retryDelay: this.config.retryDelay
      }
    };
  }

  // Pull Request Operations
  async mergePullRequest(prNumber, mergeMethod = 'merge') {
    const errors = this.validateParams({
      prNumber,
      mergeMethod
    }, {
      prNumber: {
        required: true,
        type: 'number',
        min: 1
      },
      mergeMethod: {
        required: true,
        type: 'string',
        pattern: /^(merge|squash|rebase)$/
      }
    });

    if (errors.length > 0) {
      return {
        success: false,
        error: 'Parameter validation failed',
        details: errors,
        context: {
          operation: 'mergePullRequest',
          prNumber,
          timestamp: new Date().toISOString()
        }
      };
    }

    try {
      return await this.retryOperation(async () => {
        // First, check if PR exists and can be merged
        const prDetails = await window.get_issue({
          owner: this.config.owner,
          repo: this.config.repo,
          issue_number: prNumber
        });

        if (!prDetails.pull_request) {
          throw new Error(`Issue #${prNumber} is not a pull request`);
        }

        // Attempt to merge
        const mergeResult = await window.merge_pull_request({
          owner: this.config.owner,
          repo: this.config.repo,
          pull_number: prNumber,
          merge_method: mergeMethod
        });

        return {
          success: true,
          data: {
            message: `Successfully merged PR #${prNumber}`,
            mergeCommitSha: mergeResult.sha,
            method: mergeMethod
          }
        };
      }, `merging PR #${prNumber}`);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        context: {
          operation: 'mergePullRequest',
          prNumber,
          mergeMethod,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

module.exports = new GitHubService();