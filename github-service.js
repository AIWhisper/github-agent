class GitHubService {
  constructor() {
    this.config = {
      owner: 'AIWhisper',
      repo: 'github-agent',
      branch: 'main'
    };
  }

  async getStatus() {
    try {
      const result = await window.get_file_contents({
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
        error: `Status check failed: ${error.message}`
      };
    }
  }

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
        error: `Failed to read ${path}: ${error.message}`
      };
    }
  }

  async writeFile(path, content) {
    try {
      const result = await window.push_files({
        owner: this.config.owner,
        repo: this.config.repo,
        branch: this.config.branch,
        files: [{
          path: path,
          content: content
        }],
        message: `Update ${path} via GitHub agent`
      });

      return {
        success: true,
        data: `Successfully updated ${path}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write ${path}: ${error.message}`
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
          size: f.size
        })) : []
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to list files: ${error.message}`
      };
    }
  }

  setBranch(branch) {
    this.config.branch = branch;
    return {
      success: true,
      data: { branch: branch }
    };
  }
}

module.exports = new GitHubService();