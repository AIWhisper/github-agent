import { GitHubCommand, GitHubResponse, OperationStatus } from '../types/interface';

export abstract class BaseProcessor {
  protected command: GitHubCommand;
  protected updateStatus: (status: Partial<OperationStatus>) => void;

  constructor(command: GitHubCommand, statusUpdater: (status: Partial<OperationStatus>) => void) {
    this.command = command;
    this.updateStatus = statusUpdater;
  }

  abstract process(): Promise<GitHubResponse>;

  protected createResponse(success: boolean, data?: any, error?: any): GitHubResponse {
    return {
      success,
      data,
      error,
      status: success ? 'completed' : 'failed',
      commandId: this.command.commandId,
      timestamp: Date.now()
    };
  }
}