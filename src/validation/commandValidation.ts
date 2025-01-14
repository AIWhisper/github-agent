import { GeneralAgentCommand } from '../interface/types';

export interface ValidationResult {
  isValid: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export function validateCommand(command: GeneralAgentCommand): ValidationResult {
  // Check command type
  if (command.commandType !== 'github_operation') {
    return {
      isValid: false,
      error: {
        code: 'INVALID_COMMAND_TYPE',
        message: 'Command type must be "github_operation"'
      }
    };
  }

  // Validate operation type
  const validTypes = ['code', 'repo', 'branch', 'pr', 'issue'];
  if (!validTypes.includes(command.operation.type)) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_OPERATION_TYPE',
        message: `Operation type must be one of: ${validTypes.join(', ')}`
      }
    };
  }

  // Validate priority
  const validPriorities = ['high', 'normal', 'low'];
  if (!validPriorities.includes(command.operation.priority)) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_PRIORITY',
        message: `Priority must be one of: ${validPriorities.join(', ')}`
      }
    };
  }

  // Validate metadata
  if (!command.metadata.requestId || !command.metadata.timestamp) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_METADATA',
        message: 'Request ID and timestamp are required in metadata'
      }
    };
  }

  return { isValid: true };
}