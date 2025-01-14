import { GitHubCommand } from '../types/interface';

export class CommandValidator {
  private static readonly REQUIRED_FIELDS = ['type', 'action', 'params'];
  private static readonly VALID_TYPES = ['code', 'repo', 'branch', 'issue', 'pr'];

  static validate(command: GitHubCommand): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    this.REQUIRED_FIELDS.forEach(field => {
      if (!(field in command)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate command type
    if (!this.VALID_TYPES.includes(command.type)) {
      errors.push(`Invalid command type: ${command.type}`);
    }

    // Validate timestamp
    if (!command.timestamp || typeof command.timestamp !== 'number') {
      errors.push('Invalid or missing timestamp');
    }

    // Validate params
    if (typeof command.params !== 'object') {
      errors.push('Params must be an object');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}