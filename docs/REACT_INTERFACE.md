# GitHub Agent React Interface

## Overview
This React component provides a user interface for interacting with the GitHub agent. It allows users to perform file operations (write, read, list) and check status through a web interface.

## Component Structure

### State Management
```typescript
const [loading, setLoading] = useState(false);  // Tracks operation status
const [result, setResult] = useState(null);    // Stores operation results
const [error, setError] = useState(null);      // Tracks any errors
const [command, setCommand] = useState('write'); // Current selected command
const [filePath, setFilePath] = useState('');   // File path input
const [fileContent, setFileContent] = useState(''); // File content for write operations
```

### Main Operations

1. **Write Files**
   - Creates or updates files in the repository
   - Requires file path and content
   ```javascript
   const pushFileParams = {
     owner: 'AIWhisper',
     repo: 'github-agent',
     branch: 'main',
     files: [{
       path: filePath,
       content: fileContent
     }],
     message: 'File operation via interface'
   };
   ```

2. **Read Files**
   - Retrieves file contents
   - Requires only file path
   ```javascript
   const response = await window.get_file_contents({
     owner: 'AIWhisper',
     repo: 'github-agent',
     path: filePath
   });
   ```

3. **List Directory Contents**
   - Shows files in a directory
   - Uses '.' for root directory if no path provided
   ```javascript
   const response = await window.get_file_contents({
     owner: 'AIWhisper',
     repo: 'github-agent',
     path: filePath || '.'
   });
   ```

## UI Elements

### Command Selection
- Four command buttons (Write, Read, List, Status)
- Visual feedback for selected command
- Icons for easy identification

### Input Fields
1. File Path Input
   - Required for all file operations
   - Example format: 'test/example.txt'

2. Content Textarea
   - Only shown for write operations
   - Accepts multi-line text

### Feedback Elements
1. Loading State
   - Disabled button during operations
   - Loading text feedback

2. Error Display
   - Red background for errors
   - Clear error message display

3. Result Display
   - Green background for success
   - Red background for failures
   - JSON-formatted result display

## Testing Guide

### Basic Tests

1. Write Operation
```
File Path: test/test-write.txt
Content: This is a test file created on January 11, 2025.
```

2. Read Operation
```
File Path: README.md
```

3. List Operation
```
File Path: test     (list test directory)
File Path: docs     (list docs directory)
File Path: .        (list root directory)
```

### Advanced Tests

Create Markdown File:
```
File Path: docs/test-report.md
Content:
# Test Report
## Overview
Testing GitHub agent interface functionality
- Write operations
- Read operations
- List operations

## Status
All operations functioning as expected.
```

## Error Handling
- Invalid path handling
- Network error handling
- Permission error handling
- Missing input validation

## Dependencies
- React
- @/components/ui/card (shadcn/ui)
- lucide-react@0.263.1

## Styling
- Uses Tailwind CSS for styling
- Responsive design (mobile-first)
- Clear visual feedback for all states

## Future Improvements
1. File upload support
2. Directory creation
3. File deletion
4. Branch switching
5. Commit history viewing