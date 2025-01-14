import { CommandValidator } from './CommandValidator';
import { OperationQueue } from './OperationQueue';
import { ErrorHandler } from './ErrorHandler';
import { GitHubCommand, GitHubResponse, OperationStatus } from '../types/interface';
import { CodeProcessor } from '../processors/CodeProcessor';
import { RepoProcessor } from '../processors/RepoProcessor';

export class GitHubInterface {
  private queue: OperationQueue;
  private processorMap: Map<string, any>;

  constructor() {
    this.queue = new OperationQueue();
    this.processorMap = new Map([
      ['code', CodeProcessor],
      ['repo', RepoProcessor],
      // Add other processors here
    ]);
  }

  async executeCommand(command: GitHubCommand): Promise<string> {
    // Validate command
    const validation = CommandValidator.validate(command);
    if (!validation.valid) {
      throw new Error(`Invalid command: ${validation.errors.join(', ')}`);
    }

    // Enqueue command
    const commandId = this.queue.enqueue(command);
    
    // Process command asynchronously
    this.processCommand(commandId).catch(error => {
      console.error(`Error processing command ${commandId}:`, error);
      this.queue.updateStatus(commandId, { 
        status: 'failed',
        message: error.message
      });
    });

    return commandId;
  }

  async getStatus(commandId: string): Promise<OperationStatus | undefined> {
    return this.queue.getStatus(commandId);
  }

  private async processCommand(commandId: string): Promise<void> {
    const command = this.queue.dequeue();
    if (!command || command.commandId !== commandId) {
      throw new Error('Command not found');
    }

    const ProcessorClass = this.processorMap.get(command.type);
    if (!ProcessorClass) {
      throw new Error(`No processor found for command type: ${command.type}`);
    }

    const processor = new ProcessorClass(
      command,
      (status: Partial<OperationStatus>) => this.queue.updateStatus(commandId, status)
    );

    try {
      const response = await processor.process();
      this.queue.updateStatus(commandId, {
        status: response.success ? 'completed' : 'failed',
        message: response.error?.message || 'Operation completed',
      });
    } catch (error) {
      const errorResponse = ErrorHandler.handleError(error as Error, command);
      this.queue.updateStatus(commandId, {
        status: 'failed',
        message: errorResponse.message,
      });
      throw error;
    }
  }
}