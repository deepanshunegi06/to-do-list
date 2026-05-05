const express = require('express');
const app = express();
const PORT = process.env.PORT || 80;

app.get('/', (req, res) => {
  res.send('GitHub Actions CI/CD Working 🚀');
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});