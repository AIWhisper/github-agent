import { CodeProcessor } from '../../src/processors/CodeProcessor';
import { GitHubCommand } from '../../src/types/interface';

describe('CodeProcessor', () => {
  const mockStatusUpdater = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should process create code command', async () => {
    const command: GitHubCommand = {
      type: 'code',
      action: 'create',
      params: {
        path: 'src/test.ts',
        content: 'console.log("test");'
      },
      timestamp: Date.now(),
      commandId: 'test-cmd-1'
    };

    const processor = new CodeProcessor(command, mockStatusUpdater);
    const response = await processor.process();

    expect(response.success).toBe(true);
    expect(mockStatusUpdater).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'processing'
      })
    );
  });

  test('should handle unsupported actions', async () => {
    const command: GitHubCommand = {
      type: 'code',
      action: 'unsupported',
      params: {},
      timestamp: Date.now(),
      commandId: 'test-cmd-2'
    };

    const processor = new CodeProcessor(command, mockStatusUpdater);
    const response = await processor.process();

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });
});