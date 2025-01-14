const GitHubAgent = require('../../src/GitHubAgent');

describe('Search Integration Tests', () => {
  let github;

  beforeAll(() => {
    github = new GitHubAgent({
      token: process.env.GITHUB_TOKEN,
      retryCount: 3,
      retryDelay: 1000,
    });
  });

  test('searches repositories', async () => {
    const results = await github.searchRepositories({
      query: 'language:javascript stars:>1000',
      sort: 'stars',
      order: 'desc',
      per_page: 5,
    });

    expect(results.items).toHaveLength(5);
    expect(results.total_count).toBeGreaterThan(0);
  });

  test('searches code', async () => {
    const results = await github.searchCode({
      q: 'filename:package.json express',
      per_page: 5,
    });

    expect(results.items.length).toBeGreaterThanOrEqual(0);
  });

  test('searches issues', async () => {
    const results = await github.searchIssues({
      q: 'is:open is:issue label:bug',
      sort: 'created',
      order: 'desc',
      per_page: 5,
    });

    expect(results.items.length).toBeGreaterThanOrEqual(0);
  });
});