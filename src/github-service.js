async function mergePullRequest({ owner, repo, pull_number }) {
  try {
    // Step 1: Check if PR exists and is open
    const pr = await get_issue({
      owner,
      repo,
      issue_number: pull_number
    });

    if (!pr) {
      return {
        success: false,
        error: 'Pull request not found'
      };
    }

    if (pr.state !== 'open') {
      return {
        success: false,
        error: 'Pull request is not open'
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
      message: `PR #${pull_number} merged successfully`,
      pr: pr
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to merge PR',
      context: {
        operation: 'mergePullRequest',
        pr: pull_number
      }
    };
  }
}

async function getPullRequestStatus({ owner, repo, pull_number }) {
  try {
    const pr = await get_issue({
      owner,
      repo,
      issue_number: pull_number
    });

    if (!pr) {
      return {
        success: false,
        error: 'Pull request not found'
      };
    }

    return {
      success: true,
      pr: {
        number: pr.number,
        title: pr.title,
        state: pr.state,
        mergeable: pr.state === 'open',
        url: pr.html_url
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch PR status'
    };
  }
}

module.exports = {
  mergePullRequest,
  getPullRequestStatus
};