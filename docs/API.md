# GitHub Agent API Documentation

## Core Interface

### GitHubAgent

The main class for executing GitHub operations.

```typescript
class GitHubAgent {
  async executeCommand(command: GitHubCommand): Promise<GitHubResponse>
}
```

## Supported Operations

### create_or_update_file
Creates or updates a file in a GitHub repository.

```typescript
{
  function: 'create_or_update_file',
  parameters: {
    owner: string;      // Repository owner
    repo: string;       // Repository name
    path: string;       // File path
    content: string;    // File content
    message: string;    // Commit message
    branch?: string;    // Optional: target branch
    sha?: string;       // Required when updating existing files
  }
}
```

### search_repositories
Searches for GitHub repositories.

```typescript
{
  function: 'search_repositories',
  parameters: {
    query: string;      // Search query
    page?: number;      // Optional: page number
    perPage?: number;   // Optional: results per page
  }
}
```

[Additional operations documented similarly...]

## Error Handling

The agent provides detailed error information in the response:

```typescript
{
  success: false,
  error: {
    message: 'Error description',
    details: {           // Optional additional error context
      code: 'ERROR_CODE',
      params: ['param1', 'param2']
    }
  },
  requestId: 'original-request-id'
}
```

## Integration Example

```typescript
const agent = new GitHubAgent();

// Create a new repository
const response = await agent.executeCommand({
  function: 'create_repository',
  parameters: {
    name: 'new-repo',
    description: 'Test repository',
    private: false
  },
  requestId: 'create-repo-123'
});

if (response.success) {
  console.log('Repository created:', response.data);
} else {
  console.error('Error:', response.error?.message);
}
```

## Best Practices

1. Always include a unique requestId for tracking operations
2. Handle both success and error cases
3. Validate parameters before sending commands
4. Use appropriate error handling for different scenarios