const { getTestIdentifier, cleanupRepository } = require('./setup');
const GitHubAgent = require('../../src/GitHubAgent');

describe('Issues Integration Tests', () => {
  let github;
  let testRepo;

  beforeAll(() => {
    github = new GitHubAgent({
      token: process.env.GITHUB_TOKEN,
      retryCount: 3,
      retryDelay: 1000,
    });
  });

  beforeEach(async () => {
    testRepo = `test-repo-${getTestIdentifier()}`;
    await github.createRepository({
      name: testRepo,
      autoInit: true,
    });
  });

  afterEach(async () => {
    await cleanupRepository(github, 'AIWhisper', testRepo);
  });

  test('creates and updates issues', async () => {
    // Create issue
    const issue = await github.createIssue({
      owner: 'AIWhisper',
      repo: testRepo,
      title: 'Test Issue',
      body: 'This is a test issue',
      labels: ['bug'],
    });

    expect(issue.title).toBe('Test Issue');
    expect(issue.body).toBe('This is a test issue');
    expect(issue.labels[0].name).toBe('bug');

    // Update issue
    const updated = await github.updateIssue({
      owner: 'AIWhisper',
      repo: testRepo,
      issue_number: issue.number,
      state: 'closed',
      labels: ['bug', 'resolved'],
    });

    expect(updated.state).toBe('closed');
    expect(updated.labels).toHaveLength(2);
  });

  test('handles issue comments', async () => {
    const issue = await github.createIssue({
      owner: 'AIWhisper',
      repo: testRepo,
      title: 'Issue with comments',
    });

    const comment = await github.addIssueComment({
      owner: 'AIWhisper',
      repo: testRepo,
      issue_number: issue.number,
      body: 'Test comment',
    });

    expect(comment.body).toBe('Test comment');

    const comments = await github.listIssueComments({
      owner: 'AIWhisper',
      repo: testRepo,
      issue_number: issue.number,
    });

    expect(comments).toHaveLength(1);
    expect(comments[0].body).toBe('Test comment');
  });
});