class ClaudeGitHubParser {
  constructor() {
    this.commandRegex = /^(?:github|gh)\s+(\w+)(?:\s+(.*))?$/i;
    this.config = {
      owner: 'AIWhisper',
      repo: 'github-agent',
      branch: 'main'
    };
    // Store function references
    this.githubApi = {
      push_files,
      get_file_contents
    };
  }

  async executeRead(filename) {
    if (!filename) {
      return { success: false, error: 'Filename required' };
    }

    try {
      const response = await this.githubApi.get_file_contents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filename
      });

      if (!response?.content) {
        return { success: false, error: 'No content found in file' };
      }

      const content = atob(response.content);
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: `Failed to read file: ${error.message}` };
    }
  }

  async executeWrite(args) {
    const parts = this.parseArgs(args);
    if (parts.length < 2) {
      return { success: false, error: 'Both filename and content are required' };
    }

    try {
      const [filename, ...contentParts] = parts;
      const content = contentParts.join(' ');
      
      const result = await this.githubApi.push_files({
        owner: this.config.owner,
        repo: this.config.repo,
        branch: this.config.branch,
        files: [{ path: filename, content }],
        message: `Update ${filename} via chat interface`
      });
      
      if (result?.ref) {
        return { 
          success: true, 
          data: `Successfully wrote to ${filename}`
        };
      } else {
        throw new Error('Push operation failed');
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to write file: ${error.message}` 
      };
    }
  }

  async executeStatus() {
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

  parseArgs(argsString) {
    if (!argsString) return [];
    return argsString.trim().split(/\s+/);
  }

  async parseAndExecute(input) {
    const match = input.match(this.commandRegex);
    if (!match) return { success: false, error: 'Not a valid GitHub command' };

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
          return { success: false, error: `Unknown command: ${command}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}