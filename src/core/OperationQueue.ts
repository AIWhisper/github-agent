import { GitHubCommand, OperationStatus } from '../types/interface';

export class OperationQueue {
  private queue: GitHubCommand[] = [];
  private status: Map<string, OperationStatus> = new Map();

  enqueue(command: GitHubCommand): string {
    const commandId = this.generateCommandId();
    this.queue.push({ ...command, commandId });
    
    this.status.set(commandId, {
      commandId,
      status: 'queued',
      timestamp: Date.now()
    });

    return commandId;
  }

  dequeue(): GitHubCommand | undefined {
    return this.queue.shift();
  }

  updateStatus(commandId: string, status: Partial<OperationStatus>): void {
    const currentStatus = this.status.get(commandId);
    if (currentStatus) {
      this.status.set(commandId, {
        ...currentStatus,
        ...status,
        timestamp: Date.now()
      });
    }
  }

  getStatus(commandId: string): OperationStatus | undefined {
    return this.status.get(commandId);
  }

  private generateCommandId(): string {
    return `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}