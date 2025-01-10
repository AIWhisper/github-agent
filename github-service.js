class GitHubService {
  constructor() {
    this.config = require('./github-agent-config.json');
    this.defaultRepo = this.config.defaultRepo;
    this.defaultOwner = this.config.defaultOwner;
    this.defaultBranch = this.config.defaultBranch;
  }

  async pushFile(filename, content, message = 'Update file') {
    return await this.pushFiles([{ path: filename, content }], message);
  }

  async pushFiles(files, message) {
    return await this._withRetry(async () => {
      const params = {
        repo: this.defaultRepo,
        owner: this.defaultOwner,
        branch: this.defaultBranch,
        files: files,
        message: message
      };
      return await this._callGitHub('push_files', params);
    });
  }

  async getFile(filename) {
    return await this._withRetry(async () => {
      const params = {
        path: filename,
        repo: this.defaultRepo,
        owner: this.defaultOwner
      };
      return await this._callGitHub('get_file_contents', params);
    });
  }

  async _withRetry(operation) {
    let lastError;
    for (let attempt = 1; attempt <= this.config.errorHandling.maxRetries; attempt++) {
      try {
        const result = await operation();
        return { success: true, data: result };
      } catch (error) {
        lastError = error;
        if (attempt < this.config.errorHandling.maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.errorHandling.retryDelay * attempt)
          );
        }
      }
    }
    return { success: false, error: lastError.message };
  }

  async _callGitHub(functionName, params) {
    // Direct call to GitHub API functions
    if (typeof window[functionName] === 'function') {
      return await window[functionName](params);
    }
    throw new Error(`GitHub function ${functionName} not available`);
  }
}

module.exports = new GitHubService();