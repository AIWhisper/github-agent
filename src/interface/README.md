# GitHub Agent Interface Layer

This directory contains the core interface implementation for the GitHub Agent, handling communication with the general agent.

## Components

### Types (`types.ts`)
Defines the core types and interfaces used throughout the interface layer:
- Command structures
- Response formats
- Error reporting

### Command Handler (`CommandHandler.ts`)
Manages incoming commands from the general agent:
- Validates command format
- Queues operations
- Provides status updates

### Queue Manager (`../queue/QueueManager.ts`)
Handles operation queuing and processing:
- Priority-based queue management
- Concurrent operation limiting
- Operation state tracking

### Validation (`../validation/commandValidation.ts`)
Provides command validation:
- Type checking
- Parameter validation
- Format verification

## Usage

```typescript
// Initialize command handler
const handler = new CommandHandler();

// Handle incoming command
const response = await handler.handleCommand({
  commandType: 'github_operation',
  operation: {
    type: 'code',
    action: 'commit',
    parameters: { /* ... */ },
    priority: 'normal'
  },
  metadata: {
    requestId: 'req_123',
    timestamp: Date.now(),
    source: 'general_agent'
  }
});
```

## Next Steps

1. Implement operation processors for each operation type
2. Add comprehensive error handling
3. Implement rate limiting
4. Add monitoring and logging
5. Create test suite