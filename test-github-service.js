const GitHubService = require('./github-service');

// Test suite
async function runTests() {
  console.log('Starting GitHub Service Tests\n');
  
  // Test 1: Status Check
  console.log('Test 1: Status Check');
  const statusResult = await GitHubService.getStatus();
  console.log('Status:', JSON.stringify(statusResult, null, 2), '\n');

  // Test 2: Write File
  console.log('Test 2: Write File');
  const writeResult = await GitHubService.writeFile(
    'test.txt',
    'Hello from test suite'
  );
  console.log('Write:', JSON.stringify(writeResult, null, 2), '\n');

  // Test 3: Read File
  console.log('Test 3: Read File');
  const readResult = await GitHubService.readFile('test.txt');
  console.log('Read:', JSON.stringify(readResult, null, 2), '\n');

  // Test 4: List Files
  console.log('Test 4: List Files');
  const listResult = await GitHubService.listFiles('.');
  console.log('List:', JSON.stringify(listResult, null, 2), '\n');

  // Test 5: Branch Switch
  console.log('Test 5: Branch Switch');
  const branchResult = GitHubService.setBranch('test-branch');
  console.log('Branch:', JSON.stringify(branchResult, null, 2), '\n');
}

// Run tests
console.log('GitHub Service Test Suite');
console.log('=======================');
runTests().catch(console.error);