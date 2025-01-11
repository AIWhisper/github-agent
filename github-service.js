class GitHubService {
  constructor() {
    this.config = {
      owner: 'AIWhisper',
      repo: 'github-agent',
      branch: 'main'
    };
  }

  // Core file operation using the documented push_files method
  async writeFile(path, content, message = null) {
    try {
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
    } catch (error) {
      return {
        success: false,
        error: `Write failed: ${error.message}`
      };
    }
  }

  // Other operations
  async readFile(path) {
    try {
      const response = await window.get_file_contents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: path
      });

      return {
        success: true,
        data: Buffer.from(response.content, 'base64').toString('utf8')
      };
    } catch (error) {
      return {
        success: false,
        error: `Read failed: ${error.message}`
      };
    }
  }

  async listFiles(path = '.') {
    try {
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
    } catch (error) {
      return {
        success: false,
        error: `List failed: ${error.message}`
      };
    }
  }

  getStatus() {
    return {
      success: true,
      data: {
        repo: this.config.repo,
        owner: this.config.owner,
        branch: this.config.branch,
        ready: true
      }
    };
  }

  setBranch(branch) {
    if (!branch) return { success: false, error: 'Branch name required' };
    this.config.branch = branch;
    return { success: true, data: { branch } };
  }
}

module.exports = new GitHubService();