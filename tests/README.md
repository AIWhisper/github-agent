# GitHub Agent Tests

## Test Structure

### Unit Tests
Located in `tests/github-service.test.js`
- Tests individual functions and components
- Uses mocked GitHub API responses
- Fast execution, no external dependencies

### Integration Tests
Located in `tests/integration/github-service.integration.test.js`
- Tests real GitHub API interactions
- Requires GitHub token
- Tests complete operation flows

## Running Tests

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. For integration tests:
   - Copy `.env.example` to `.env`
   - Add your GitHub token to `.env`

### Running Tests

#### Unit Tests
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration
```

#### All Tests
```bash
# Run both unit and integration tests
npm run test:all
```

## Test Coverage

Unit tests aim for 100% coverage of:
- Core service functions
- Error handling
- Retry mechanisms

Integration tests cover:
- Complete operation flows
- Rate limiting handling
- Error scenarios with real API

## Adding New Tests

### Unit Tests
1. Add test cases to `github-service.test.js`
2. Mock any external calls
3. Test both success and failure scenarios

### Integration Tests
1. Add test cases to `github-service.integration.test.js`
2. Ensure proper cleanup of test resources
3. Consider rate limiting in test design

## Best Practices

1. Always run unit tests before committing
2. Keep integration tests focused and efficient
3. Clean up test resources after integration tests
4. Don't commit `.env` file
5. Update test documentation when adding new features