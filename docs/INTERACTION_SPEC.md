# GitHub Agent - Interaction Model

## 1. Command Interface (General Agent → GitHub Agent)

### 1.1 Code Update Commands
```typescript
interface CodeUpdateCommand {
  type: 'code_update';
  action: 'commit' | 'push' | 'create_branch' | 'merge';
  payload: {
    files: Array<{
      path: string;
      content: string;
      message?: string;
    }>;
    branch: string;
    commitMessage?: string;
  };
  metadata: {
    requestId: string;
    priority: 'high' | 'normal' | 'low';
    timestamp: number;
  };
}
```

### 1.2 Repository Management
```typescript
interface RepoCommand {
  type: 'repo_management';
  action: 'create' | 'fork' | 'configure' | 'delete';
  payload: {
    name: string;
    options: {
      private?: boolean;
      description?: string;
      // ... other repo settings
    };
  };
}
```

## 2. Query Interface (General Agent ← GitHub Agent)

### 2.1 Status Queries
```typescript
interface StatusQuery {
  type: 'status';
  target: 'repo' | 'branch' | 'commit' | 'workflow';
  filter: {
    name?: string;
    branch?: string;
    since?: string;
    // ... other filters
  };
}

interface StatusResponse {
  success: boolean;
  data: {
    status: string;
    lastUpdate: string;
    details: {
      [key: string]: any;
    };
  };
  metadata: {
    timestamp: string;
    dataFreshness: 'realtime' | 'cached';
  };
}
```

### 2.2 Information Queries
```typescript
interface InfoQuery {
  type: 'info';
  resource: 'commits' | 'branches' | 'pull_requests' | 'issues';
  options: {
    limit?: number;
    skip?: number;
    sort?: string;
    filter?: object;
  };
}
```

## 3. Event Notifications (GitHub Agent → General Agent)

### 3.1 Operation Completion
```typescript
interface OperationNotification {
  type: 'operation_complete' | 'operation_failed';
  operationId: string;
  result: {
    success: boolean;
    data?: any;
    error?: {
      code: string;
      message: string;
      recovery?: string[];
    };
  };
}
```

### 3.2 State Changes
```typescript
interface StateChangeNotification {
  type: 'state_change';
  resource: string;
  change: {
    before: any;
    after: any;
    timestamp: string;
  };
  importance: 'critical' | 'important' | 'info';
}
```

## 4. Error Handling

### 4.1 Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    context?: any;
    suggestions?: string[];
    retryable: boolean;
  };
  state?: {
    valid: boolean;
    recovery?: string[];
  };
}
```

## 5. Implementation Guidelines

### 5.1 Command Processing
1. Validate incoming command format
2. Check prerequisites
3. Execute GitHub operation
4. Return standardized response
5. Notify completion/failure

### 5.2 Query Handling
1. Validate query parameters
2. Check cache if applicable
3. Fetch requested information
4. Format response
5. Update cache if needed

### 5.3 State Management
1. Track operation status
2. Maintain operation history
3. Enable operation recovery
4. Provide progress updates