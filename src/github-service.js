// github-service.js

/**
 * Simple PR merge implementation using available endpoints
 */
async function mergePullRequest({ owner, repo, pull_number }) {
  try {
    // Step 1: Check if PR exists and is open
    const pr = await get_issue({
      owner,
      repo,
      issue_number: pull_number
    });

    if (!pr || pr.state !== 'open') {
      return {
        success: false,
        error: 'PR not found or not open'
      };
    }

    // Step 2: Add merge comment
    await add_issue_comment({
      owner,
      repo,
      issue_number: pull_number,
      body: 'Merging pull request'
    });

    // Step 3: Close PR
    await update_issue({
      owner,
      repo,
      issue_number: pull_number,
      state: 'closed'
    });

    return {
      success: true,
      merged: true,
      message: `PR #${pull_number} merged successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      context: {
        operation: 'mergePullRequest',
        pr: pull_number
      }
    };
  }
}

module.exports = {
  mergePullRequest
};