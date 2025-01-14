import { ErrorResponse, GitHubCommand } from '../types/interface';

export class ErrorHandler {
  static handleError(error: Error, command: GitHubCommand): ErrorResponse {
    // Map known error types to specific error codes
    const errorResponse: ErrorResponse = {
      code: this.getErrorCode(error),
      message: error.message,
      timestamp: Date.now(),
      commandId: command.commandId
    };

    // Add additional error details if available
    if (error instanceof Error && 'details' in error) {
      errorResponse.details = (error as any).details;
    }

    // Log error for monitoring
    console.error(`Error processing command ${command.commandId}:`, error);

    return errorResponse;
  }

  private static getErrorCode(error: Error): string {
    // Map error types to specific error codes
    if (error.name === 'ValidationError') return 'VALIDATION_ERROR';
    if (error.name === 'GitHubAPIError') return 'GITHUB_API_ERROR';
    if (error.name === 'TimeoutError') return 'TIMEOUT_ERROR';
    return 'INTERNAL_ERROR';
  }
}