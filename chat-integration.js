class ChatGitHubIntegration {
  constructor() {
    this.config = {
      owner: 'AIWhisper',
      repo: 'github-agent',
      branch: 'main'
    };
  }

  // Simplified command handler focusing on core functionality
  async handleCommand(input) {
    const parts = input.split(' ');
    if (parts[0] !== 'github' && parts[0] !== 'gh') {
      return { success: false, error: 'Commands must start with "github" or "gh"' };
    }

    const command = parts[1]?.toLowerCase();
    const args = parts.slice(2);

    try {
      switch (command) {
        case 'read':
          return await this.readFile(args[0]);
          
        case 'write':
          if (args.length < 2) {
            return { success: false, error: 'Need filename and content' };
          }
          return await this.writeFile(args[0], args.slice(1).join(' '));
          
        case 'status':
          return {
            success: true,
            data: {
              repo: this.config.repo,
              branch: this.config.branch,
              ready: true
            }
          };
          
        default:
          return {
            success: false,
            error: 'Unknown command. Available: read, write, status'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Command failed: ${error.message}`
      };
    }
  }

  async readFile(filename) {
    if (!filename) {
      return { success: false, error: 'Filename required' };
    }

    try {
      const response = await window.get_file_contents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filename
      });

      if (!response?.content) {
        return { success: false, error: 'No content found' };
      }

      return {
        success: true,
        data: Buffer.from(response.content, 'base64').toString('utf8')
      };
    } catch (error) {
      return { success: false, error: `Read failed: ${error.message}` };
    }
  }

  async writeFile(filename, content) {
    if (!filename || !content) {
      return { success: false, error: 'Filename and content required' };
    }

    try {
      const result = await window.push_files({
        owner: this.config.owner,
        repo: this.config.repo,
        branch: this.config.branch,
        files: [{
          path: filename,
          content: content
        }],
        message: `Update ${filename} via GitHub agent`
      });

      return {
        success: true,
        data: `File ${filename} updated successfully`
      };
    } catch (error) {
      return { success: false, error: `Write failed: ${error.message}` };
    }
  }
}

module.exports = new ChatGitHubIntegration();