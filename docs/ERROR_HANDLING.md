# Error Handling Documentation

## Pull Request Merge Functionality

### Overview
The `mergePullRequest` function provides a simplified mechanism for merging pull requests using available GitHub API endpoints. This implementation focuses on basic PR closure and status updates.

### Function Signature
```javascript
mergePullRequest({ owner, repo, pull_number })
```

### Parameters
- `owner` (string): Repository owner
- `repo` (string): Repository name
- `pull_number` (number): Pull request number

### Response Format
Success Response:
```javascript
{
  success: true,
  merged: true,
  message: "PR #{number} merged successfully"
}
```

Error Response:
```javascript
{
  success: false,
  error: "Error message",
  context: {
    operation: "mergePullRequest",
    pr: pull_number
  }
}
```

### Error Cases
1. PR Not Found
   - Error returned when pull request doesn't exist
   - Includes PR number in context

2. PR Not Open
   - Error returned when PR is already closed
   - Includes current PR state in context

3. API Failures
   - Network or permission errors
   - Includes operation context

### Implementation Notes
- Uses sequential API calls to manage PR state
- Maintains audit trail via PR comments
- Follows project's standard error format
- Simple implementation prioritizing reliability

### Usage Example
```javascript
const result = await mergePullRequest({
  owner: 'AIWhisper',
  repo: 'github-agent',
  pull_number: 4
});
```