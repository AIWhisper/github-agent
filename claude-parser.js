class ClaudeGitHubParser {
  constructor() {
    this.commandRegex = /^(?:github|gh)\s+(\w+)(?:\s+(.*))?$/i;
  }

  async parseAndExecute(input) {
    const match = input.match(this.commandRegex);
    if (!match) return null;

    const [, command, args = ''] = match;
    
    try {
      switch(command.toLowerCase()) {
        case 'read':
          return await this.executeRead(args.trim());
        case 'write':
          return await this.executeWrite(args);
        case 'status':
          return await this.executeStatus();
        default:
          return { success: false, error: 'Unknown command' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async executeRead(filename) {
    if (!filename) return { success: false, error: 'Filename required' };
    
    const response = await get_file_contents({
      owner: 'AIWhisper',
      repo: 'github-agent',
      path: filename
    });

    if (response && response.content) {
      const content = atob(response.content);
      return { success: true, data: content };
    }
    return { success: false, error: 'Could not read file content' };
  }

  async executeWrite(args) {
    const parts = this.parseArgs(args);
    if (parts.length < 2) {
      return { success: false, error: 'Filename and content required' };
    }

    const [filename, ...contentParts] = parts;
    const content = contentParts.join(' ');
    
    await push_files({
      owner: 'AIWhisper',
      repo: 'github-agent',
      branch: 'main',
      files: [{ path: filename, content }],
      message: 'Update from chat interface'
    });
    
    return { success: true, data: 'File written successfully' };
  }

  async executeStatus() {
    return {
      success: true,
      data: {
        repo: 'github-agent',
        owner: 'AIWhisper',
        branch: 'main',
        ready: true
      }
    };
  }

  parseArgs(argsString) {
    if (!argsString) return [];
    return argsString.trim().split(/\s+/);
  }
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaudeGitHubParser;
}