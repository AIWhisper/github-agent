class ClaudeGitHubParser {
  constructor(chatIntegration) {
    this.chatIntegration = chatIntegration;
    this.commandRegex = /^(?:github|gh)\s+(\w+)(?:\s+(.*))?$/i;
  }

  async parseAndExecute(input) {
    // Check if input is a GitHub command
    const match = input.match(this.commandRegex);
    if (!match) return null;

    const [, command, args] = match;
    return await this.chatIntegration.handleCommand(`${command} ${args || ''}`.trim());
  }

  formatResponse(result) {
    if (!result) return 'Not a GitHub command';
    
    if (!result.success) {
      return `Error: ${result.error}`;
    }

    // Format successful response based on command type
    if (typeof result.data === 'string') {
      return result.data;
    }
    
    return JSON.stringify(result.data, null, 2);
  }
}

module.exports = ClaudeGitHubParser;
