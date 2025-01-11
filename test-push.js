const GitHubService = require('./github-service');

async function testPushFiles() {
  console.log('Testing push_files implementation');
  
  const testFile = 'test-output.txt';
  const testContent = 'Testing push_files at ' + new Date().toISOString();

  const result = await GitHubService.writeFile(testFile, testContent);
  console.log('Write result:', result);

  if (result.success) {
    const readResult = await GitHubService.readFile(testFile);
    console.log('Read result:', readResult);
  }
}

testPushFiles().catch(console.error);