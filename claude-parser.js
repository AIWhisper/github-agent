class ClaudeGitHubParser {
  constructor() {
    this.commandRegex = /^(?:github|gh)\s+(\w+)(?:\s+(.*))?$/i;
  }

  async parseAndExecute(input) {
    const match = input.match(this.commandRegex);
    if (!match) return null;

    const [, command, args = ''] = match;
    const parsedArgs = this.parseArgs(args);

    switch(command.toLowerCase()) {
      case 'read':
        return await this.executeRead(parsedArgs);
      case 'write':
        return await this.executeWrite(parsedArgs);
      case 'status':
        return await this.executeStatus();
      default:
        return { success: false, error: `Unknown command: ${command}` };
    }
  }

  parseArgs(argsString) {
    if (!argsString) return [];
    
    const args = [];
    let currentArg = '';
    let inQuotes = false;

    for (let char of argsString) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ' ' && !inQuotes) {
        if (currentArg) args.push(currentArg);
        currentArg = '';
      } else {
        currentArg += char;
      }
    }
    if (currentArg) args.push(currentArg);

    return args;
  }

  async executeRead(args) {
    if (!args[0]) return { success: false, error: 'Filename required' };
    
    try {
      const result = await window.get_file_contents({
        owner: 'AIWhisper',
        repo: 'github-agent',
        path: args[0]
      });
      return { success: true, data: Buffer.from(result.content, 'base64').toString('utf8') };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async executeWrite(args) {
    if (args.length < 2) {
      return { success: false, error: 'Filename and content required' };
    }

    try {
      const [filename, ...contentParts] = args;
      const content = contentParts.join(' ');
      
      await window.push_files({
        owner: 'AIWhisper',
        repo: 'github-agent',
        branch: 'main',
        files: [{ path: filename, content }],
        message: 'Update from Claude chat'
      });
      
      return { success: true, data: 'File written successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
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
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaudeGitHubParser;
}
