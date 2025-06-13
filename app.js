// Modern web application for 2025 deployment
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Basic route
app.get('/', (req, res) => {
  console.log("Received request:", req.url);
  res.send('Hello from WebApp (2025)!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});