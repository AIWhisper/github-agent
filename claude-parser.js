class ClaudeGitHubParser {
  constructor() {
    this.commandRegex = /^(?:github|gh)\s+(\w+)(?:\s+(.*))?$/i;
    this.config = {
      owner: 'AIWhisper',
      repo: 'github-agent',
      branch: 'main',
      maxFileSize: 1024 * 1024, // 1MB limit
      allowedExtensions: ['.js', '.json', '.md', '.txt', '.yml', '.yaml']
    };
    this.githubApi = {
      push_files,
      get_file_contents
    };
  }

  validateFilename(filename) {
    if (!filename) {
      throw new Error('Filename is required');
    }

    const ext = filename.substring(filename.lastIndexOf('.'));
    if (!this.config.allowedExtensions.includes(ext)) {
      throw new Error(`File extension "${ext}" is not allowed`);
    }

    if (filename.includes('..') || filename.startsWith('/')) {
      throw new Error('Invalid file path');
    }
  }

  validateContent(content) {
    if (!content) {
      throw new Error('Content is required');
    }

    if (Buffer.from(content).length > this.config.maxFileSize) {
      throw new Error('File size exceeds maximum limit');
    }
  }

  async executeRead(filename) {
    try {
      this.validateFilename(filename);

      const response = await this.githubApi.get_file_contents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filename
      });

      if (!response?.content) {
        throw new Error('No content found in file');
      }

      const content = atob(response.content);
      return { success: true, data: content };
    } catch (error) {
      const errorMessage = this.formatErrorMessage('read', error);
      return { success: false, error: errorMessage };
    }
  }

  async executeWrite(args) {
    try {
      const parts = this.parseArgs(args);
      if (parts.length < 2) {
        throw new Error('Both filename and content are required');
      }

      const [filename, ...contentParts] = parts;
      const content = contentParts.join(' ');

      this.validateFilename(filename);
      this.validateContent(content);
      
      const result = await this.githubApi.push_files({
        owner: this.config.owner,
        repo: this.config.repo,
        branch: this.config.branch,
        files: [{ path: filename, content }],
        message: `Update ${filename} via chat interface`
      });
      
      if (!result?.ref) {
        throw new Error('Push operation failed');
      }

      return { 
        success: true, 
        data: `Successfully wrote to ${filename}`
      };
    } catch (error) {
      const errorMessage = this.formatErrorMessage('write', error);
      return { success: false, error: errorMessage };
    }
  }

  async executeStatus() {
    try {
      // Check if we can access the repository
      await this.githubApi.get_file_contents({
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
          ready: true,
          maxFileSize: this.config.maxFileSize,
          allowedExtensions: this.config.allowedExtensions
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Repository access failed: ' + error.message
      };
    }
  }

  formatErrorMessage(operation, error) {
    const baseMessage = `Failed to ${operation} file`;
    
    if (error.status === 404) {
      return `${baseMessage}: File not found`;
    }
    
    if (error.status === 403) {
      return `${baseMessage}: Permission denied`;
    }

    if (error.status === 422) {
      return `${baseMessage}: Invalid request`;
    }

    return `${baseMessage}: ${error.message}`;
  }

  parseArgs(argsString) {
    if (!argsString) return [];
    
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      parts.push(current);
    }
    
    return parts.map(part => part.replace(/^"|"$/g, ''));
  }

  async parseAndExecute(input) {
    const match = input.match(this.commandRegex);
    if (!match) {
      return { 
        success: false, 
        error: 'Not a valid GitHub command. Use "github" or "gh" followed by a command.' 
      };
    }

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
          return { 
            success: false, 
            error: `Unknown command: ${command}. Available commands: read, write, status` 
          };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}