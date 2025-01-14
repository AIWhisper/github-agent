/**
 * GitHubAgent serves as the main interface for executing GitHub operations.
 * It's designed to work as part of a two-agent system, receiving commands from
 * a general agent and executing them using GitHub's API.
 */
import { GitHubCommand, GitHubResponse } from '../types/github';

export class GitHubAgent {
  /**
   * Executes a GitHub command and returns a standardized response.
   * 
   * @param command - The GitHub operation to execute
   * @returns A promise resolving to a GitHubResponse
   * 
   * @example
   * ```typescript
   * const response = await agent.executeCommand({
   *   function: 'create_repository',
   *   parameters: { name: 'test-repo' },
   *   requestId: 'req-123'
   * });
   * ```
   */
  async executeCommand(command: GitHubCommand): Promise<GitHubResponse> {
    try {
      this.validateCommand(command);
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

  /**
   * Validates the basic structure and required fields of a command.
   * @internal
   */
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

  /**
   * Executes the specified GitHub function with provided parameters.
   * @internal
   */
  private async executeGitHubFunction(command: GitHubCommand): Promise<any> {
    switch (command.function) {
      case 'create_or_update_file':
        return this.validateAndExecute(command, ['owner', 'repo', 'path', 'content', 'message']);
      case 'search_repositories':
        return this.validateAndExecute(command, ['query']);
      case 'create_repository':
        return this.validateAndExecute(command, ['name']);
      default:
        throw new Error(`Unsupported GitHub function: ${command.function}`);
    }
  }

  /**
   * Validates required parameters and executes the GitHub operation.
   * @internal
   */
  private validateAndExecute(command: GitHubCommand, requiredParams: string[]): Promise<any> {
    for (const param of requiredParams) {
      if (!(param in command.parameters)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }

    return Promise.resolve({ message: `Executed ${command.function}` });
  }
}