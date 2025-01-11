class ChatGitHubIntegration {
  constructor() {
    this.config = {
      owner: 'AIWhisper',
      repo: 'github-agent',
      branch: 'main'
    };
  }

  async handleCommand(input) {
    const parts = input.split(' ');
    if (parts[0] !== 'github' && parts[0] !== 'gh') {
      return { success: false, error: 'Command must start with github or gh' };
    }

    const command = parts[1]?.toLowerCase();
    const args = parts.slice(2);

    try {
      switch(command) {
        case 'write': {
          if (args.length < 2) {
            return { success: false, error: 'Need filename and content' };
          }
          const filename = args[0];
          const content = args.slice(1).join(' ');
          return await window.push_files({
            owner: this.config.owner,
            repo: this.config.repo,
            branch: this.config.branch,
            files: [{ path: filename, content }],
            message: `Update ${filename} via chat`
          });
        }

        case 'read': {
          if (!args[0]) {
            return { success: false, error: 'Filename required' };
          }
          const response = await window.get_file_contents({
            owner: this.config.owner,
            repo: this.config.repo,
            path: args[0]
          });
          return {
            success: true,
            data: Buffer.from(response.content, 'base64').toString('utf8')
          };
        }

        case 'list': {
          const path = args[0] || '.';
          const response = await window.get_file_contents({
            owner: this.config.owner,
            repo: this.config.repo,
            path
          });
          return {
            success: true,
            data: Array.isArray(response) ? response.map(f => f.name).join('\n') : []
          };
        }

        case 'status':
          return {
            success: true,
            data: {
              repo: this.config.repo,
              branch: this.config.branch,
              ready: true
            }
          };

        case 'branch':
          if (!args[0]) {
            return { success: false, error: 'Branch name required' };
          }
          this.config.branch = args[0];
          return { success: true, data: { branch: args[0] }};

        default:
          return { 
            success: false, 
            error: 'Unknown command. Available: write, read, list, status, branch'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Command failed: ${error.message}`
      };
    }
  }
}

module.exports = new ChatGitHubIntegration();