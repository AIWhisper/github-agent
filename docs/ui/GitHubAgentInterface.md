# GitHub Agent Interface Component

## Overview
The GitHubAgentInterface component provides a user interface for interacting with GitHub repositories through the GitHub Agent service. It supports file operations (write, read, list) and status checking.

## Features
- File Operations:
  - Write: Create or update files in the repository
  - Read: Retrieve file contents
  - List: View directory contents
  - Status: Check GitHub agent configuration and status

## Installation
```jsx
import { GitHubAgentInterface } from '@/ui';
```

## Usage
```jsx
function App() {
  return (
    <div>
      <GitHubAgentInterface />
    </div>
  );
}
```

## Props
The component currently doesn't accept any props as it uses the global GitHub service configuration.

## Component Structure

### State Management
```javascript
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);
const [error, setError] = useState(null);
const [command, setCommand] = useState('write');
const [filePath, setFilePath] = useState('');
const [fileContent, setFileContent] = useState('');
```

### Key Functions

#### validateInput()
Validates user input based on the selected command.
- Required fields for 'write': filePath and fileContent
- Required fields for 'read': filePath
- Returns: boolean

#### executeOperation()
Executes the selected GitHub operation through the githubService.
- Handles all async operations
- Manages loading states
- Handles error cases
- Updates result state

#### handleCommandChange(newCommand)
Manages command type changes and resets relevant state.
- Parameters:
  - newCommand: 'write' | 'read' | 'list' | 'status'

## Error Handling
The component handles errors at multiple levels:
1. Input validation
2. Operation execution
3. Service-level errors

Errors are displayed using the Alert component from the UI library.

## Response Format
Successful operations return a response object:
```javascript
{
  success: true,
  data: {
    // Operation-specific data
  }
}
```

Error responses:
```javascript
{
  success: false,
  error: "Error message",
  context: {
    operation: "operationName",
    timestamp: "ISO timestamp"
  }
}
```

## Dependencies
- React
- @/components/ui/card
- @/components/ui/alert
- lucide-react
- github-service

## UI Elements
1. Command Selection Buttons
   - Write (Edit icon)
   - Read (FileText icon)
   - List (FolderOpen icon)
   - Status (RefreshCw icon)

2. Input Fields
   - File Path (for write, read, list)
   - Content (for write)

3. Execute Button
   - Shows loading spinner during operations
   - Disabled during loading

4. Result Display
   - JSON formatted output
   - Error alerts when needed

## Styling
Uses Tailwind CSS classes for styling with a responsive design.