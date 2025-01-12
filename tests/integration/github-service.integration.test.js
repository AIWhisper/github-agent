const GitHubService = require('../../github-service');

// Note: These tests require a valid GitHub token with appropriate permissions
// Set GITHUB_TOKEN environment variable before running

describe('GitHub Service Integration', () => {
  let service;
  const testFilePath = 'test/integration-test.txt';
  const testContent = `Integration test content ${Date.now()}`;

  beforeAll(() => {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required for integration tests');
    }
    service = new GitHubService();
  });

  describe('File Operations Flow', () => {
    test('should handle complete file operation flow', async () => {
      // 1. Write file
      const writeResult = await service.writeFile(testFilePath, testContent);
      expect(writeResult.success).toBe(true);
      expect(writeResult.data).toContain('Successfully updated');

      // 2. Read file
      const readResult = await service.readFile(testFilePath);
      expect(readResult.success).toBe(true);
      expect(readResult.data).toBe(testContent);

      // 3. List files
      const listResult = await service.listFiles('test');
      expect(listResult.success).toBe(true);
      expect(listResult.data.some(file => file.path === testFilePath)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent files', async () => {
      const result = await service.readFile('non-existent-file.txt');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    test('should handle invalid paths', async () => {
      const result = await service.writeFile('/invalid/path/file.txt', 'content');
      expect(result.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    test('should handle rate limits gracefully', async () => {
      // Make multiple rapid requests to potentially trigger rate limiting
      const promises = Array(10).fill().map(() => 
        service.readFile(testFilePath)
      );

      const results = await Promise.all(promises);
      
      // All requests should either succeed or fail gracefully
      results.forEach(result => {
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.context).toBeDefined();
        }
      });
    });
  });
});
