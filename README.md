# GitHub Agent

A specialized agent designed to handle GitHub operations as part of a two-agent system. This agent communicates with a general agent that handles the UI and user interactions.

## Overview

The GitHub Agent provides a clean interface for executing GitHub operations through standardized commands and responses. It implements the same set of GitHub functions available in the MCP tools.

## Core Components

### GitHubAgent
The main interface that receives commands from the general agent and executes GitHub operations.

```typescript
const agent = new GitHubAgent();
const response = await agent.executeCommand({
  function: 'create_repository',
  parameters: { name: 'test-repo' },
  requestId: 'req-123'
});
```

### Supported Operations

The agent supports all GitHub operations available in the MCP tools:
- `create_or_update_file`
- `search_repositories`
- `create_repository`
- `get_file_contents`
- `push_files`
- `create_issue`
- `create_pull_request`
- And more...

## Command Format

```typescript
interface GitHubCommand {
  function: GitHubFunction;  // The GitHub operation to execute
  parameters: Record<string, any>;  // Operation-specific parameters
  requestId: string;  // Unique identifier for the request
}
```

## Response Format

```typescript
interface GitHubResponse {
  success: boolean;  // Operation success status
  data?: any;  // Operation result data
  error?: {  // Error information if operation failed
    message: string;
    details?: any;
  };
  requestId: string;  // Original request identifier
}
```

## Error Handling

The agent provides standardized error responses with detailed messages and maintains the requestId for tracking purposes.

## Development

This is part of Phase 5.1: Interface Development, focusing on:
- Command reception
- Response formatting
- Error handling
- GitHub API integration