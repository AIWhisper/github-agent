// Test the complete chat-to-GitHub pipeline
const ChatGitHubIntegration = require('./chat-integration');
const GitHubService = require('./github-service');

// Test messages
const commands = [
  'github status',
  'github write test.txt "Hello from the test pipeline"',
  'github read test.txt'
];

async function testPipeline() {
  console.log('Starting pipeline test...\n');
  
  for (const command of commands) {
    console.log(`Testing command: ${command}`);
    try {
      const result = await ChatGitHubIntegration.handleCommand(command);
      console.log('Result:', JSON.stringify(result, null, 2), '\n');
    } catch (error) {
      console.error('Error:', error.message, '\n');
    }
  }
}

testPipeline().catch(console.error);