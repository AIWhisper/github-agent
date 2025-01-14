import { GitHubCommand, GitHubResponse } from '../types/github';

export class GitHubAgent {
  async executeCommand(command: GitHubCommand): Promise<GitHubResponse> {
    try {
      // Validate command
      this.validateCommand(command);

      // Execute GitHub function
      const result = await this.executeGitHubFunction(command);

      return {
        success: true,
        data: result,
        requestId: command.requestId
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          details: error.details
        },
        requestId: command.requestId
      };
    }
  }

  private validateCommand(command: GitHubCommand): void {
    if (!command.function) {
      throw new Error('GitHub function not specified');
    }
    if (!command.parameters) {
      throw new Error('Command parameters are required');
    }
    if (!command.requestId) {
      throw new Error('Request ID is required');
    }
  }

  private async executeGitHubFunction(command: GitHubCommand): Promise<any> {
    // Here we would integrate with actual GitHub API functions
    // For now, this is a placeholder that matches the MCP tool structure
    switch (command.function) {
      case 'create_or_update_file':
        return this.validateAndExecute(command, ['owner', 'repo', 'path', 'content', 'message']);
      case 'search_repositories':
        return this.validateAndExecute(command, ['query']);
      case 'create_repository':
        return this.validateAndExecute(command, ['name']);
      // Add other functions as needed
      default:
        throw new Error(`Unsupported GitHub function: ${command.function}`);
    }
  }

  private validateAndExecute(command: GitHubCommand, requiredParams: string[]): Promise<any> {
    // Validate required parameters
    for (const param of requiredParams) {
      if (!(param in command.parameters)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }

    // Here we would make the actual GitHub API call
    // This is where we'd integrate with the existing GitHub functions
    return Promise.resolve({ message: `Executed ${command.function}` });
  }
}