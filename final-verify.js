// Final verification of push_files implementation

async function verify() {
  try {
    // 1. Write file via push_files
    const writeResult = await window.push_files({
      owner: 'AIWhisper',
      repo: 'github-agent',
      branch: 'main',
      files: [{
        path: 'test-final.txt',
        content: 'Final verification test'
      }],
      message: 'Final verification'
    });
    console.log('Write result:', writeResult);

    // 2. Read it back
    const readResponse = await window.get_file_contents({
      owner: 'AIWhisper',
      repo: 'github-agent',
      path: 'test-final.txt'
    });
    console.log('Read content:', Buffer.from(readResponse.content, 'base64').toString('utf8'));

    return 'Verification successful';
  } catch (error) {
    return `Verification failed: ${error.message}`;
  }
}

verify().then(console.log).catch(console.error);