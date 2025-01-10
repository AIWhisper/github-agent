class ChatGitHubIntegration {
  constructor() {
    this.githubService = require('./github-service');
    this.config = require('./github-agent-config.json');
    this.chatState = {
      lastOperation: null,
      errors: [],
      successfulOperations: 0
    };
  }

  async handleGitHubRequest(request) {
    try {
      // Log operation start
      this.chatState.lastOperation = {
        type: request.type,
        startTime: new Date()
      };

      let result;
      switch(request.type) {
        case 'push':
          result = await this.githubService.pushFile(
            request.filename,
            request.content,
            request.message
          );
          break;

        case 'get':
          result = await this.githubService.getFile(request.filename);
          break;

        default:
          throw new Error('Unsupported operation');
      }

      // Update success stats
      this.chatState.successfulOperations++;
      return result;

    } catch (error) {
      // Log error
      this.chatState.errors.push({
        time: new Date(),
        error: error.message,
        operation: this.chatState.lastOperation
      });
      throw error;
    }
  }

  getStatus() {
    return {
      operations: this.chatState.successfulOperations,
      lastOperation: this.chatState.lastOperation,
      errors: this.chatState.errors.length,
      ready: true
    };
  }
}

module.exports = new ChatGitHubIntegration();