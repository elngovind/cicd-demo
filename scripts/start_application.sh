#!/bin/bash

# Ubuntu-specific startup script
echo "Running Ubuntu-specific startup script"

# Create a simple app.js file that listens on port 80
echo "Creating app.js file to serve on port 80"
mkdir -p /var/www/html
cat > /var/www/html/app.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 80;

const server = http.createServer((req, res) => {
  // Serve index.html for root path
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error loading index.html');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    });
  } 
  // Serve CSS files
  else if (req.url.match(/\.css$/)) {
    const cssPath = path.join(__dirname, req.url);
    fs.readFile(cssPath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/css');
      res.end(data);
    });
  }
  // Serve image files
  else if (req.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
    const imgPath = path.join(__dirname, req.url);
    fs.readFile(imgPath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      res.statusCode = 200;
      const ext = path.extname(req.url).substring(1);
      res.setHeader('Content-Type', `image/${ext}`);
      res.end(data);
    });
  }
  // Serve JavaScript files
  else if (req.url.match(/\.js$/)) {
    const jsPath = path.join(__dirname, req.url);
    fs.readFile(jsPath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/javascript');
      res.end(data);
    });
  }
  // Handle 404 for all other requests
  else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

// Need to run as root to bind to port 80
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
EOF

# Install PM2 globally
echo "Installing PM2..."
npm install -g pm2 || true

# Start the application with PM2 as root (needed for port 80)
cd /var/www/html
pm2 stop app 2>/dev/null || true
pm2 start app.js --name app || true
pm2 save || true

# Ensure PM2 starts on system boot
pm2 startup systemd || true
pm2 save || true

echo "Node.js application started with PM2 on port 80"

# Always exit with success
exit 0