# GitHub Agent

A specialized GitHub operations service designed to be used by general AI agents for consistent and reliable GitHub interactions.

## Purpose

This agent provides a standardized interface for handling GitHub operations, making it easier for general AI agents to:
- Execute GitHub operations consistently
- Handle errors gracefully
- Maintain state between operations
- Get predictable response formats

## Architecture

### 1. GitHub Service (`github-service.js`)
Core service layer that handles:
- Direct GitHub API interactions
- Robust error handling
- Retry mechanisms with exponential backoff
- Operation state management
- Standardized response formats

```javascript
// Example service usage
const githubService = require('./github-service');

// Operations return consistent response format
const response = await githubService.writeFile('test.txt', 'content');
// {
//   success: true,
//   data: "Successfully updated test.txt"
// }
```

### 2. Agent Interface (`src/ui/components/GitHubAgentInterface`)
Provides a structured interface specification for:
- Available commands (write, read, list, status)
- Required inputs for each operation
- Expected response formats
- Error handling patterns

## Local Development Setup

1. **Prerequisites**
   - Node.js (v16 or higher)
   - npm or yarn
   - GitHub personal access token with required permissions

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Add your GitHub token and other configuration
   ```

3. **Installation**
   ```bash
   npm install
   ```

4. **Running Tests**
   ```bash
   # Unit tests
   npm run test:unit
   
   # Integration tests
   npm run test:integration
   
   # All tests
   npm test
   ```

## Testing Infrastructure

### Unit Tests
- Located in `tests/unit/`
- Focus on individual component functionality
- Mock external dependencies
- Fast execution for rapid development

### Integration Tests
- Located in `tests/integration/`
- Test complete operation workflows
- Require GitHub API access
- Include automatic cleanup
- Default timeout: 30 seconds
- Support for parallel test execution

### Test Utilities
- Unique test identifiers for isolation
- Automatic resource cleanup
- Environment validation
- Configurable timeouts
- Helper functions for common operations

## Integration Guide

### For General Agents

1. **Operation Types**
   - `write`: Create or update files
   - `read`: Retrieve file contents
   - `list`: Get directory contents
   - `status`: Check agent configuration

2. **Response Format**
```javascript
{
  success: boolean,
  data?: any,
  error?: string,
  context?: {
    operation: string,
    timestamp: string,
    ...additional context
  }
}
```

3. **Error Handling**
   - All operations include built-in retries
   - Exponential backoff for rate limits
   - Detailed error context
   - Consistent error response format

## Security

- Scoped permissions
- Configurable retry limits
- Operation logging
- Error tracing
- Environment-based configuration

## Future Improvements

- [ ] Enhanced operation logging
- [ ] Expanded GitHub API coverage
- [ ] Configurable operation timeouts
- [ ] Operation batching support
- [ ] Advanced state persistence
- [ ] Additional integration test scenarios
- [ ] Performance benchmarking tools
- [ ] GitHub Actions workflow templates