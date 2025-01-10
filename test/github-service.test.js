// Test file for github-service.js
try {
  const service = require('../github-service');
  
  // Test 1: Push a test file
  console.log('Test 1: Pushing test file...');
  service.pushFile('test-output.txt', 'Test content', 'Test commit');
  
  // Test 2: Read the file back
  console.log('Test 2: Reading test file...');
  service.getFile('test-output.txt');

} catch (error) {
  console.error('Test failed:', error);
}