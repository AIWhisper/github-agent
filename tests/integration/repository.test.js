const { getTestIdentifier, cleanupRepository } = require('./setup');
const GitHubAgent = require('../../src/GitHubAgent');

describe('Repository Integration Tests', () => {
  let github;
  let testRepo;

  beforeAll(() => {
    github = new GitHubAgent({
      token: process.env.GITHUB_TOKEN,
      retryCount: 3,
      retryDelay: 1000,
    });
  });

  beforeEach(() => {
    testRepo = `test-repo-${getTestIdentifier()}`;
  });

  afterEach(async () => {
    await cleanupRepository(github, 'AIWhisper', testRepo);
  });

  test('creates and deletes repository', async () => {
    const repo = await github.createRepository({
      name: testRepo,
      description: 'Test repository',
      private: true,
      autoInit: true,
    });

    expect(repo.name).toBe(testRepo);
    expect(repo.description).toBe('Test repository');
    expect(repo.private).toBe(true);

    const deleted = await github.deleteRepository({
      owner: 'AIWhisper',
      repo: testRepo,
    });

    expect(deleted).toBe(true);
  });

  test('handles repository operations with retries', async () => {
    // Create repository
    await github.createRepository({
      name: testRepo,
      autoInit: true,
    });

    // Create branch
    const branch = await github.createBranch({
      owner: 'AIWhisper',
      repo: testRepo,
      branch: 'feature/test',
    });

    expect(branch.ref).toContain('feature/test');

    // Create file
    const file = await github.createOrUpdateFile({
      owner: 'AIWhisper',
      repo: testRepo,
      path: 'test.md',
      message: 'Add test file',
      content: Buffer.from('# Test\nThis is a test file.').toString('base64'),
      branch: 'feature/test',
    });

    expect(file.content.path).toBe('test.md');

    // Create pull request
    const pr = await github.createPullRequest({
      owner: 'AIWhisper',
      repo: testRepo,
      title: 'Test PR',
      body: 'This is a test pull request',
      head: 'feature/test',
      base: 'main',
    });

    expect(pr.title).toBe('Test PR');
    expect(pr.head.ref).toBe('feature/test');
    expect(pr.base.ref).toBe('main');
  });
});