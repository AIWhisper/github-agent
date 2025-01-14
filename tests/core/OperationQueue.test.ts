import { OperationQueue } from '../../src/core/OperationQueue';
import { GitHubCommand } from '../../src/types/interface';

describe('OperationQueue', () => {
  let queue: OperationQueue;

  beforeEach(() => {
    queue = new OperationQueue();
  });

  test('should enqueue and dequeue commands', () => {
    const command: GitHubCommand = {
      type: 'repo',
      action: 'create',
      params: { name: 'test-repo' },
      timestamp: Date.now()
    };

    const commandId = queue.enqueue(command);
    expect(commandId).toBeDefined();

    const status = queue.getStatus(commandId);
    expect(status?.status).toBe('queued');

    const dequeued = queue.dequeue();
    expect(dequeued?.type).toBe(command.type);
  });

  test('should update operation status', () => {
    const command: GitHubCommand = {
      type: 'repo',
      action: 'create',
      params: {},
      timestamp: Date.now()
    };

    const commandId = queue.enqueue(command);
    queue.updateStatus(commandId, { status: 'processing', progress: 50 });

    const status = queue.getStatus(commandId);
    expect(status?.status).toBe('processing');
    expect(status?.progress).toBe(50);
  });
});