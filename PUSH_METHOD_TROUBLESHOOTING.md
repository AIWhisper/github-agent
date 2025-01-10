# GitHub Repository File Push Method Troubleshooting

## Successful Push Method

### Critical Requirements
1. Non-empty `files` array
2. Each file MUST contain:
   - `path`: Destination file path in repository
   - `content`: Full file content

### Working Example
```javascript
push_files({
  'repo': 'github-agent',
  'owner': 'AIWhisper',
  'branch': 'main',
  'files': [{
    'path': 'example_file.md', 
    'content': '# Actual content here'
  }],
  'message': 'Commit description'
})
```

## Common Failure Points
- Empty `files` array
- Missing `path` or `content`
- Incorrect repository or branch specifications

## Debugging Steps
1. Ensure `files` array is non-empty
2. Provide complete `path` and `content`
3. Verify repository name, owner, and branch

## Successful Patterns
- Always include at least one file
- Use meaningful file paths
- Provide complete file content

## Important Notes
- Method requires actual file content
- Empty content or files will cause errors