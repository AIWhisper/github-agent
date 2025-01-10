class ChatGitHubIntegration {
  constructor() {
    this.githubService = require('./github-service');
    this.config = require('./github-agent-config.json');
  }

  async handleCommand(command) {
    const parts = command.trim().split(' ');
    const action = parts[0].toLowerCase();

    try {
      switch(action) {
        case 'read':
          return await this.githubService.getFile(parts[1]);

        case 'write':
          const filename = parts[1];
          const content = parts.slice(2).join(' ');
          return await this.githubService.pushFile(filename, content, 'Update from chat');

        case 'list':
          return await this.githubService.getFile('');

        case 'status':
          return {
            success: true,
            data: {
              repo: this.config.defaultRepo,
              branch: this.config.defaultBranch,
              ready: true
            }
          };

        case 'branch':
          this.config.defaultBranch = parts[1];
          return {
            success: true,
            data: { branch: parts[1] }
          };

        default:
          return {
            success: false,
            error: 'Unknown command. Available commands: read, write, list, status, branch'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ChatGitHubIntegration();