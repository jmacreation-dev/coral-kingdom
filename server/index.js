/**
 * Coral Kingdom — Express shell
 * Serves the AngularJS static front-end. MongoDB is optional / placeholder only;
 * the UI does not require a running database.
 */
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '..', 'public');

// Placeholder for future MongoDB wiring (not connected; UI works without it)
const mongoPlaceholder = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/coral-kingdom',
  connected: false,
  note: 'Front-end only — DB not required for the game screen',
};

app.use(express.static(publicDir));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'coral-kingdom',
    mongo: mongoPlaceholder,
  });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Coral Kingdom running at http://localhost:${PORT}`);
  console.log('(MongoDB not required for UI)');
});
