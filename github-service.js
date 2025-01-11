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

  // Basic file operation with retry
  async writeFile(path, content, message = null) {
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

  // Configuration method for retry options
  setRetryOptions(maxRetries, retryDelay) {
    if (maxRetries) {
      if (typeof maxRetries !== 'number' || maxRetries < 1) {
        throw new Error('maxRetries must be a positive number');
      }
      this.config.maxRetries = maxRetries;
    }
    if (retryDelay) {
      if (typeof retryDelay !== 'number' || retryDelay < 0) {
        throw new Error('retryDelay must be a non-negative number');
      }
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
}

module.exports = new GitHubService();