const express = require('express');
const { mergePullRequest, getPullRequestStatus } = require('./github-service');

const app = express();
app.use(express.json());

// Get PR status
app.get('/api/pr/:owner/:repo/:pull_number', async (req, res) => {
  try {
    const { owner, repo, pull_number } = req.params;
    const result = await getPullRequestStatus({
      owner,
      repo,
      pull_number: parseInt(pull_number, 10)
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Merge PR
app.post('/api/merge/:owner/:repo/:pull_number', async (req, res) => {
  try {
    const { owner, repo, pull_number } = req.params;
    const result = await mergePullRequest({
      owner,
      repo,
      pull_number: parseInt(pull_number, 10)
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});