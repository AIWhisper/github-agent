import { GeneralAgentCommand, OperationPriority } from '../interface/types';

interface QueuedOperation {
  id: string;
  command: GeneralAgentCommand;
  priority: OperationPriority;
  timestamp: number;
}

export class QueueManager {
  private operationQueue: QueuedOperation[] = [];
  private activeOperations: Map<string, QueuedOperation> = new Map();

  async queueOperation(command: GeneralAgentCommand): Promise<string> {
    const operationId = this.generateOperationId();
    
    const queuedOperation: QueuedOperation = {
      id: operationId,
      command,
      priority: command.operation.priority,
      timestamp: Date.now()
    };

    this.operationQueue.push(queuedOperation);
    this.sortQueue();

    // Attempt to process queue
    await this.processNextOperation();

    return operationId;
  }

  private sortQueue(): void {
    this.operationQueue.sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by timestamp
      return a.timestamp - b.timestamp;
    });
  }

  private async processNextOperation(): Promise<void> {
    // Check if we can process more operations
    if (this.activeOperations.size >= this.getMaxConcurrentOperations()) {
      return;
    }

    const nextOperation = this.operationQueue.shift();
    if (!nextOperation) {
      return;
    }

    this.activeOperations.set(nextOperation.id, nextOperation);
    // TODO: Implement actual operation processing
  }

  private getMaxConcurrentOperations(): number {
    // TODO: Make this configurable and consider GitHub API rate limits
    return 5;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}