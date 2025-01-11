const ChatGitHubIntegration = require('./chat-integration');

async function testCommands() {
  const tests = [
    // Test status
    {
      name: 'Status Check',
      command: 'github status'
    },
    // Test write
    {
      name: 'Write File',
      command: 'github write test-file.txt "Content for testing"'
    },
    // Test read
    {
      name: 'Read File',
      command: 'github read test-file.txt'
    },
    // Test list
    {
      name: 'List Files',
      command: 'github list'
    },
    // Test branch
    {
      name: 'Switch Branch',
      command: 'github branch test-branch'
    }
  ];

  console.log('Starting Command Tests\n');

  for (const test of tests) {
    console.log(`Test: ${test.name}`);
    console.log(`Command: ${test.command}`);
    
    try {
      const result = await ChatGitHubIntegration.handleCommand(test.command);
      console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }
    console.log('---\n');
  }
}

testCommands().catch(console.error);