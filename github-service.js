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

        // Specific error handling based on status codes
        if (error.status === 404) {
          throw new Error(`Resource not found: ${context}`);
        }
        if (error.status === 403) {
          throw new Error(`Access denied to ${context}. Check permissions.`);
        }
        if (attempts === this.config.maxRetries) {
          throw new Error(`Operation failed after ${attempts} attempts: ${error.message}`);
        }
      }
    }
    throw lastError;
  }

  // Utility for delay
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Parameter validation utility
  validateParams(params, required) {
    const missing = required.filter(key => !params[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
  }

  // Enhanced file operations with retry and validation
  async writeFile(path, content, message = null) {
    try {
      this.validateParams({ path, content }, ['path', 'content']);

      return await this.retryOperation(async () => {
        const result = await window.push_files({
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

  async readFile(path) {
    try {
      this.validateParams({ path }, ['path']);

      return await this.retryOperation(async () => {
        const response = await window.get_file_contents({
          owner: this.config.owner,
          repo: this.config.repo,
          path: path
        });

        return {
          success: true,
          data: Buffer.from(response.content, 'base64').toString('utf8')
        };
      }, `reading file ${path}`);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        context: {
          operation: 'readFile',
          path,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  async listFiles(path = '.') {
    try {
      return await this.retryOperation(async () => {
        const response = await window.get_file_contents({
          owner: this.config.owner,
          repo: this.config.repo,
          path: path
        });

        return {
          success: true,
          data: Array.isArray(response) ? response.map(f => ({
            name: f.name,
            type: f.type,
            path: f.path
          })) : []
        };
      }, `listing files in ${path}`);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        context: {
          operation: 'listFiles',
          path,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  getStatus() {
    return {
      success: true,
      data: {
        ...this.config,
        ready: true,
        version: '1.1.0'
      }
    };
  }

  setBranch(branch) {
    try {
      this.validateParams({ branch }, ['branch']);
      this.config.branch = branch;
      return { 
        success: true, 
        data: { branch } 
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        context: {
          operation: 'setBranch',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Configuration methods
  setRetryOptions(maxRetries, retryDelay) {
    try {
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
    } catch (error) {
      return {
        success: false,
        error: error.message,
        context: {
          operation: 'setRetryOptions',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

module.exports = new GitHubService();