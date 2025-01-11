class GitHubService {
  constructor() {
    this.config = {
      owner: 'AIWhisper',
      repo: 'github-agent',
      branch: 'main'
    };
  }

  // Core file operations
  async readFile(path) {
    try {
      const response = await window.get_file_contents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: path
      });

      if (!response?.content) {
        throw new Error('No content found');
      }

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

  async writeFile(path, content, message = null) {
    try {
      const encodedContent = Buffer.from(content).toString('base64');
      
      const result = await window.push_files({
        owner: this.config.owner,
        repo: this.config.repo,
        branch: this.config.branch,
        files: [{
          path: path,
          content: encodedContent,
          encoding: 'base64'
        }],
        message: message || `Update ${path} via GitHub agent`
      });

      if (!result?.ref) {
        throw new Error('Push operation failed');
      }

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

  // Directory operations
  async listFiles(path = '.') {
    try {
      const response = await window.get_file_contents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: path
      });

      if (!Array.isArray(response)) {
        return {
          success: true,
          data: []
        };
      }

      return {
        success: true,
        data: response.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
          path: f.path
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: `List failed: ${error.message}`
      };
    }
  }

  // Repository operations
  async getStatus() {
    try {
      await window.get_file_contents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: '.'
      });

      return {
        success: true,
        data: {
          repo: this.config.repo,
          owner: this.config.owner,
          branch: this.config.branch,
          ready: true
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Status check failed: ${error.message}`,
        data: {
          ready: false
        }
      };
    }
  }

  setBranch(branch) {
    if (!branch) {
      return {
        success: false,
        error: 'Branch name required'
      };
    }

    this.config.branch = branch;
    return {
      success: true,
      data: { branch: branch }
    };
  }
}

module.exports = new GitHubService();