const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Route handlers for clean URLs
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/register.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/support.html'));
});

app.get('/create-event', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/create-event.html'));
});

app.get('/event-info', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/event-info.html'));
});

app.get('/report-incident', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/report-incident.html'));
});

// Catch-all route for 404s
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`EventHive server running on http://localhost:${PORT}`);
});
