import { GitHubAgent } from '../../src/core/GitHubAgent';
import { GitHubCommand } from '../../src/types/github';

describe('GitHubAgent', () => {
  let agent: GitHubAgent;

  beforeEach(() => {
    agent = new GitHubAgent();
  });

  test('should execute valid command', async () => {
    const command: GitHubCommand = {
      function: 'create_repository',
      parameters: { name: 'test-repo' },
      requestId: 'test-123'
    };

    const response = await agent.executeCommand(command);
    expect(response.success).toBe(true);
    expect(response.requestId).toBe(command.requestId);
  });

  test('should handle missing parameters', async () => {
    const command: GitHubCommand = {
      function: 'create_or_update_file',
      parameters: { owner: 'test' }, // Missing required params
      requestId: 'test-123'
    };

    const response = await agent.executeCommand(command);
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });

  test('should validate required command fields', async () => {
    const invalidCommand = {
      parameters: {},
      requestId: 'test-123'
    } as GitHubCommand;

    const response = await agent.executeCommand(invalidCommand);
    expect(response.success).toBe(false);
    expect(response.error?.message).toContain('function not specified');
  });
});