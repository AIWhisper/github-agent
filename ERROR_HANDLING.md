# Error Handling Documentation

This document details the error handling mechanisms implemented in the GitHub Agent service.

## Table of Contents
1. [Core Features](#core-features)
2. [Error Response Format](#error-response-format)
3. [Parameter Validation](#parameter-validation)
4. [Retry Mechanism](#retry-mechanism)
5. [Rate Limiting](#rate-limiting)
6. [Best Practices](#best-practices)

## Core Features

### Overview
The error handling system provides:
- Comprehensive parameter validation
- Automatic retry with exponential backoff
- Rate limit handling
- Detailed error context
- Consistent error response format

## Error Response Format

### Operation Errors
```javascript
{
  success: false,
  error: "Detailed error message",
  context: {
    operation: "writeFile",
    path: "file.txt",
    timestamp: "2025-01-11T17:30:00Z",
    // Additional context specific to the operation
  }
}
```

### Validation Errors
```javascript
{
  success: false,
  error: "Parameter validation failed",
  details: [
    "path must match pattern ^[a-zA-Z0-9\-_/.]+$",
    "content is required"
  ],
  context: {
    operation: "writeFile",
    timestamp: "2025-01-11T17:30:00Z"
  }
}
```

## Parameter Validation

### Validation Schema
Validation rules are defined using a schema object:

```javascript
const schema = {
  path: {
    required: true,
    type: 'string',
    pattern: /^[a-zA-Z0-9\-_/.]+$/,
    minLength: 1
  },
  count: {
    type: 'number',
    min: 0,
    max: 100
  }
};
```

### Supported Validation Rules
- **required**: Field must be present and non-null
- **type**: Type checking ('string', 'number', 'boolean')
- **pattern**: Regular expression pattern matching
- **min/max**: Number range validation
- **minLength/maxLength**: String/array length validation

### Usage Example
```javascript
const github = require('./github-service');

// Writing a file with validation
const result = await github.writeFile('test.txt', 'content');
if (!result.success) {
  if (result.error === 'Parameter validation failed') {
    console.error('Invalid parameters:', result.details);
  } else {
    console.error('Operation failed:', result.error, result.context);
  }
}
```

## Retry Mechanism

### Configuration
The retry mechanism can be configured using `setRetryOptions`:

```javascript
github.setRetryOptions(3, 1000); // 3 retries, 1s base delay
```

### Exponential Backoff
The system uses exponential backoff for retries:
- First retry: 1s delay
- Second retry: 2s delay
- Third retry: 4s delay
- etc.

### Rate Limiting
Special handling for GitHub API rate limits:
- Detects 429 status codes
- Reads 'x-ratelimit-reset' header
- Waits until rate limit reset
- Resumes operation automatically

## Best Practices

### Error Handling
```javascript
async function handleGitHubOperation() {
  const result = await github.writeFile('test.txt', 'content');
  
  if (!result.success) {
    // Handle validation errors
    if (result.error === 'Parameter validation failed') {
      console.error('Validation failed:', result.details);
      // Handle invalid parameters
      return;
    }
    
    // Handle operation errors
    console.error('Operation failed:', {
      error: result.error,
      context: result.context
    });
    // Implement fallback behavior
    return;
  }
  
  // Handle success
  console.log('Operation successful:', result.data);
}
```

### Retry Configuration
- Set reasonable retry limits based on operation type
- Consider increasing retries for critical operations
- Adjust delay based on operation duration

```javascript
// Critical operation configuration
github.setRetryOptions(5, 2000); // More retries, longer delay

// Quick operation configuration
github.setRetryOptions(2, 500); // Fewer retries, shorter delay
```

### Error Context
- Always provide operation context in error responses
- Include relevant parameters for debugging
- Add timestamps for error tracking

### Validation Tips
- Define strict validation rules for critical parameters
- Use patterns to enforce naming conventions
- Implement length limits to prevent oversized inputs
- Add custom validation rules for specific requirements

## Handled Error Types

### API Errors
- Rate limits (429)
- Not found (404)
- Permission denied (403)
- Invalid authentication (401)
- Server errors (500)

### Validation Errors
- Invalid parameter types
- Missing required fields
- Pattern mismatches
- Range violations
- Length violations

### Network Errors
- Connection timeouts
- Network failures
- DNS resolution errors

## Contributing
When adding new features:
1. Always include appropriate error handling
2. Add validation for new parameters
3. Update error documentation
4. Add test cases for error scenarios
