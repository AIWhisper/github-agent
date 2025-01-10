# GitHub Repository File Push Method

## Method Specification

```javascript
{
  'repo': 'repository-name',
  'owner': 'repository-owner',
  'branch': 'branch-name',
  'files': [{'path': 'filename', 'content': 'file content'}],
  'message': 'commit message'
}
```

## Key Requirements
- `repo`: Name of the target repository
- `owner`: GitHub username or organization owning the repository
- `branch`: Branch to push files to (typically 'main' or 'master')
- `files`: Array of file objects
  - `path`: Destination path for the file in the repository
  - `content`: Full text content of the file
- `message`: Commit message describing the changes

## Important Notes
- Files must be sent as an array, even for a single file
- Existing files at the specified path will be overwritten
- Authentication is handled separately by the system

## Example Usage
```javascript
push_files({
  'repo': 'github-agent',
  'owner': 'AIWhisper', 
  'branch': 'main',
  'files': [{'path': 'example.py', 'content': 'print("Hello, World!")'}],
  'message': 'Add example Python file'
})
```