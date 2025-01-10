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
        files: files.map(file => ({
          path: file.path,
          content: file.content
        })),
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
      const response = await this._callGitHub('get_file_contents', params);
      if (response.content) {
        return {
          success: true,
          data: Buffer.from(response.content, 'base64').toString('utf8')
        };
      }
      throw new Error('File content not found');
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
    // Map of available GitHub API functions
    const githubFunctions = {
      'push_files': window.push_files,
      'get_file_contents': window.get_file_contents
    };

    if (typeof githubFunctions[functionName] === 'function') {
      return await githubFunctions[functionName](params);
    }
    throw new Error(`GitHub function ${functionName} not available`);
  }
}

module.exports = new GitHubService();