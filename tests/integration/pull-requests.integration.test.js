const { mergePullRequest, getPullRequestStatus } = require('../../src/github-service');
const { getTestId } = require('./setup');

describe('Pull Request Integration Tests', () => {
  let testRepo;
  let pullRequestNumber;

  beforeAll(async () => {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }
    
    // Create a test repository with initial content
    testRepo = `test-repo-${getTestId()}`;
    await create_repository({
      name: testRepo,
      auto_init: true
    });

    // Create a test branch
    await create_branch({
      owner: 'AIWhisper',
      repo: testRepo,
      branch: 'test-branch'
    });

    // Create a file in the test branch
    await create_or_update_file({
      owner: 'AIWhisper',
      repo: testRepo,
      path: 'test.md',
      message: 'Add test file',
      content: Buffer.from('# Test\nThis is a test file.').toString('base64'),
      branch: 'test-branch'
    });

    // Create a pull request
    const pr = await create_pull_request({
      owner: 'AIWhisper',
      repo: testRepo,
      title: 'Test PR',
      body: 'This is a test pull request',
      head: 'test-branch',
      base: 'main'
    });

    pullRequestNumber = pr.number;
  });

  afterAll(async () => {
    // Cleanup: Delete test repository
    try {
      await delete_repository({
        owner: 'AIWhisper',
        repo: testRepo
      });
    } catch (error) {
      console.warn(`Failed to cleanup repository: ${error.message}`);
    }
  });

  describe('getPullRequestStatus', () => {
    test('should get status of an open pull request', async () => {
      const result = await getPullRequestStatus({
        owner: 'AIWhisper',
        repo: testRepo,
        pull_number: pullRequestNumber
      });

      expect(result.success).toBe(true);
      expect(result.pr).toBeDefined();
      expect(result.pr.state).toBe('open');
      expect(result.pr.mergeable).toBe(true);
    });

    test('should handle non-existent pull request', async () => {
      const result = await getPullRequestStatus({
        owner: 'AIWhisper',
        repo: testRepo,
        pull_number: 99999
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pull request not found');
    });
  });

  describe('mergePullRequest', () => {
    test('should successfully merge a pull request', async () => {
      const result = await mergePullRequest({
        owner: 'AIWhisper',
        repo: testRepo,
        pull_number: pullRequestNumber
      });

      expect(result.success).toBe(true);
      expect(result.merged).toBe(true);
      expect(result.pr).toBeDefined();
    });

    test('should handle already merged pull request', async () => {
      const result = await mergePullRequest({
        owner: 'AIWhisper',
        repo: testRepo,
        pull_number: pullRequestNumber
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pull request is not open');
    });

    test('should handle non-existent pull request', async () => {
      const result = await mergePullRequest({
        owner: 'AIWhisper',
        repo: testRepo,
        pull_number: 99999
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pull request not found');
    });

    test('should handle merge conflicts', async () => {
      // Create conflicting changes
      await create_or_update_file({
        owner: 'AIWhisper',
        repo: testRepo,
        path: 'test.md',
        message: 'Update test file in main',
        content: Buffer.from('# Test\nThis is an update in main.').toString('base64'),
        branch: 'main'
      });

      // Create new PR with conflicting changes
      await create_or_update_file({
        owner: 'AIWhisper',
        repo: testRepo,
        path: 'test.md',
        message: 'Update test file in branch',
        content: Buffer.from('# Test\nThis is a conflicting change.').toString('base64'),
        branch: 'test-branch-2'
      });

      const pr = await create_pull_request({
        owner: 'AIWhisper',
        repo: testRepo,
        title: 'Conflicting PR',
        body: 'This PR has conflicts',
        head: 'test-branch-2',
        base: 'main'
      });

      const result = await mergePullRequest({
        owner: 'AIWhisper',
        repo: testRepo,
        pull_number: pr.number
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});