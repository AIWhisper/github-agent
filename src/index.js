const express = require('express');
const { mergePullRequest } = require('./github-service');

const app = express();
app.use(express.json());

app.post('/api/merge/:owner/:repo/:pull_number', async (req, res) => {
  try {
    const { owner, repo, pull_number } = req.params;
    const result = await mergePullRequest({ owner, repo, pull_number: parseInt(pull_number, 10) });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});