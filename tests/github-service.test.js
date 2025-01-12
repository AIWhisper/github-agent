const { jest } = require('@jest/globals');
const GitHubService = require('../github-service');

// Mock window.fs and other global functions
global.window = {
  push_files: jest.fn(),
  get_file_contents: jest.fn(),
};

describe('GitHubService', () => {
  let service;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    service = new GitHubService();
  });

  describe('Core Functionality', () => {
    test('should be initialized with default config', () => {
      expect(service.config).toEqual({
        owner: 'AIWhisper',
        repo: 'github-agent',
        branch: 'main',
        maxRetries: 3,
        retryDelay: 1000
      });
    });

    test('should validate required parameters', () => {
      expect(() => {
        service.validateParams({}, ['required_param']);
      }).toThrow('Missing required parameters: required_param');
    });
  });

  describe('File Operations', () => {
    describe('writeFile', () => {
      test('should successfully write a file', async () => {
        window.push_files.mockResolvedValueOnce({ success: true });

        const result = await service.writeFile('test.txt', 'content');

        expect(result.success).toBe(true);
        expect(window.push_files).toHaveBeenCalledWith({
          owner: 'AIWhisper',
          repo: 'github-agent',
          branch: 'main',
          files: [{
            path: 'test.txt',
            content: 'content'
          }],
          message: 'Update test.txt via GitHub agent'
        });
      });

      test('should handle write errors', async () => {
        window.push_files.mockRejectedValueOnce(new Error('Write failed'));

        const result = await service.writeFile('test.txt', 'content');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Write failed');
        expect(result.context.operation).toBe('writeFile');
      });

      test('should validate required parameters', async () => {
        const result = await service.writeFile('', '');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Missing required parameters: path, content');
      });
    });

    describe('readFile', () => {
      test('should successfully read a file', async () => {
        const mockContent = Buffer.from('test content').toString('base64');
        window.get_file_contents.mockResolvedValueOnce({
          content: mockContent
        });

        const result = await service.readFile('test.txt');

        expect(result.success).toBe(true);
        expect(result.data).toBe('test content');
        expect(window.get_file_contents).toHaveBeenCalledWith({
          owner: 'AIWhisper',
          repo: 'github-agent',
          path: 'test.txt'
        });
      });

      test('should handle read errors', async () => {
        window.get_file_contents.mockRejectedValueOnce(new Error('Read failed'));

        const result = await service.readFile('test.txt');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Read failed');
        expect(result.context.operation).toBe('readFile');
      });
    });

    describe('listFiles', () => {
      test('should successfully list files', async () => {
        const mockFiles = [
          { name: 'file1.txt', type: 'file', path: 'file1.txt' },
          { name: 'file2.txt', type: 'file', path: 'file2.txt' }
        ];
        window.get_file_contents.mockResolvedValueOnce(mockFiles);

        const result = await service.listFiles('.');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockFiles.map(f => ({
          name: f.name,
          type: f.type,
          path: f.path
        })));
      });

      test('should handle list errors', async () => {
        window.get_file_contents.mockRejectedValueOnce(new Error('List failed'));

        const result = await service.listFiles('.');

        expect(result.success).toBe(false);
        expect(result.error).toBe('List failed');
        expect(result.context.operation).toBe('listFiles');
      });
    });
  });

  describe('Retry Mechanism', () => {
    test('should retry failed operations', async () => {
      const error = new Error('Operation failed');
      error.status = 500;
      window.push_files.mockRejectedValueOnce(error)
                       .mockRejectedValueOnce(error)
                       .mockResolvedValueOnce({ success: true });

      const result = await service.writeFile('test.txt', 'content');

      expect(result.success).toBe(true);
      expect(window.push_files).toHaveBeenCalledTimes(3);
    });

    test('should handle rate limits', async () => {
      const error = new Error('Rate limit exceeded');
      error.status = 429;
      error.headers = { 'x-ratelimit-reset': (Date.now() / 1000 + 1).toString() };
      
      window.push_files.mockRejectedValueOnce(error)
                       .mockResolvedValueOnce({ success: true });

      const result = await service.writeFile('test.txt', 'content');

      expect(result.success).toBe(true);
      expect(window.push_files).toHaveBeenCalledTimes(2);
    });
  });
});
