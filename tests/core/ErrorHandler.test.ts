import { ErrorHandler } from '../../src/core/ErrorHandler';
import { GitHubCommand } from '../../src/types/interface';

describe('ErrorHandler', () => {
  const mockCommand: GitHubCommand = {
    type: 'repo',
    action: 'create',
    params: {},
    timestamp: Date.now(),
    commandId: 'test-cmd-1'
  };

  test('should handle validation errors', () => {
    const error = new Error('Invalid command');
    error.name = 'ValidationError';

    const response = ErrorHandler.handleError(error, mockCommand);
    expect(response.code).toBe('VALIDATION_ERROR');
    expect(response.message).toBe('Invalid command');
    expect(response.commandId).toBe(mockCommand.commandId);
  });

  test('should handle GitHub API errors', () => {
    const error = new Error('API rate limit exceeded');
    error.name = 'GitHubAPIError';
    
    const response = ErrorHandler.handleError(error, mockCommand);
    expect(response.code).toBe('GITHUB_API_ERROR');
  });

  test('should include error details when available', () => {
    const error = new Error('Complex error');
    (error as any).details = { field: 'name', constraint: 'required' };

    const response = ErrorHandler.handleError(error, mockCommand);
    expect(response.details).toBeDefined();
    expect(response.details.field).toBe('name');
  });
});