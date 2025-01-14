import { GitHubInterface } from '../../src/core/GitHubInterface';
import { GitHubCommand } from '../../src/types/interface';

describe('GitHubInterface', () => {
  let githubInterface: GitHubInterface;

  beforeEach(() => {
    githubInterface = new GitHubInterface();
  });

  test('should execute valid command and return command ID', async () => {
    const command: GitHubCommand = {
      type: 'code',
      action: 'create',
      params: {
        path: 'test.ts',
        content: 'console.log("test");'
      },
      timestamp: Date.now()
    };

    const commandId = await githubInterface.executeCommand(command);
    expect(commandId).toBeDefined();

    const status = await githubInterface.getStatus(commandId);
    expect(status).toBeDefined();
    expect(status?.status).toBe('queued');
  });

  test('should reject invalid command', async () => {
    const invalidCommand = {
      type: 'invalid',
      action: 'create',
      params: {}
    } as GitHubCommand;

    await expect(githubInterface.executeCommand(invalidCommand))
      .rejects
      .toThrow('Invalid command');
  });

  test('should update status during command processing', async () => {
    const command: GitHubCommand = {
      type: 'code',
      action: 'create',
      params: {
        path: 'test.ts',
        content: 'console.log("test");'
      },
      timestamp: Date.now()
    };

    const commandId = await githubInterface.executeCommand(command);
    
    // Wait for processing to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const status = await githubInterface.getStatus(commandId);
    expect(status?.status).not.toBe('queued');
  });
});