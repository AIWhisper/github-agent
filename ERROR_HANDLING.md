# Error Handling Guide

## Core Features
- Automatic retry with exponential backoff
- Rate limit handling
- Parameter validation
- Detailed error context

## Quick Usage
```javascript
const github = require('./github-service');

// Optional: Configure retries
github.setRetryOptions(3, 1000); // 3 retries, 1s base delay

// Operations include built-in retries
const result = await github.writeFile('test.txt', 'content');
if (!result.success) {
  console.error('Operation failed:', result.error, result.context);
}
```

## Error Response Format
```javascript
{
  success: false,
  error: "Detailed error message",
  context: {
    operation: "writeFile",
    path: "file.txt",
    timestamp: "2025-01-11T17:30:00Z"
  }
}
```

## Handled Error Types
- Rate limits (429)
- Not found (404)
- Permission denied (403)
- Network failures
- Invalid parameters