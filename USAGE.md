# GitHub Agent Usage Guide

## Core Commands

### Write Files
```bash
github write <filename> <content>
# Example:
github write test.txt "Hello World"
```

### Read Files
```bash
github read <filename>
# Example:
github read test.txt
```

### List Directory
```bash
github list [path]
# Example:
github list
github list src/
```

### Check Status
```bash
github status
```

### Switch Branch
```bash
github branch <branchname>
# Example:
github branch dev
```

## Implementation Notes
- All file operations use the push_files method internally
- Commands can use either 'github' or 'gh' prefix
- File paths are relative to repository root
- Branch changes persist during session

## Error Handling
All commands return a consistent response structure:
```javascript
{
  success: true/false,
  data: {...} | "result message",  // on success
  error: "error message"           // on failure
}
```

## Core Files
- chat-integration.js: Handles command parsing and execution
- github-service.js: Core GitHub operations using push_files

## Common Issues
1. File not found: Check path and branch
2. Write failed: Verify content format
3. Branch errors: Ensure branch exists