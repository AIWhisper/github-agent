import { CommandValidator } from '../../src/core/CommandValidator';
import { GitHubCommand } from '../../src/types/interface';

describe('CommandValidator', () => {
  const validCommand: GitHubCommand = {
    type: 'repo',
    action: 'create',
    params: { name: 'test-repo' },
    timestamp: Date.now()
  };

  test('should validate a correct command', () => {
    const result = CommandValidator.validate(validCommand);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should detect missing required fields', () => {
    const invalidCommand = {
      type: 'repo',
      params: {}
    } as GitHubCommand;

    const result = CommandValidator.validate(invalidCommand);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: action');
  });

  test('should validate command type', () => {
    const invalidCommand = {
      ...validCommand,
      type: 'invalid'
    } as GitHubCommand;

    const result = CommandValidator.validate(invalidCommand);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid command type: invalid');
  });
});