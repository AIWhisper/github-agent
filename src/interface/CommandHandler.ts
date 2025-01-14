import { GeneralAgentCommand, OperationResponse } from './types';
import { validateCommand } from '../validation/commandValidation';
import { QueueManager } from '../queue/QueueManager';

export class CommandHandler {
  private queueManager: QueueManager;

  constructor() {
    this.queueManager = new QueueManager();
  }

  async handleCommand(command: GeneralAgentCommand): Promise<OperationResponse> {
    try {
      // Validate incoming command
      const validationResult = validateCommand(command);
      if (!validationResult.isValid) {
        return this.createErrorResponse(validationResult.error);
      }

      // Queue the operation
      const operationId = await this.queueManager.queueOperation(command);

      // Return initial response
      return {
        success: true,
        operationState: {
          id: operationId,
          status: 'queued',
          completionPercentage: 0
        }
      };
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  private createErrorResponse(error: any): OperationResponse {
    return {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        actionable: false
      },
      operationState: {
        id: 'error',
        status: 'failed'
      }
    };
  }
}