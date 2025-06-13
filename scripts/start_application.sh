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
  // Default to index.html
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Get the file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // MIME types
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
  };

  // Set content type based on file extension
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Read file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Page not found
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Need to run as root to bind to port 80
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
EOF

# Copy public directory to /var/www/html if it exists
if [ -d "/var/www/html/public" ]; then
  echo "Copying public directory contents to /var/www/html"
  cp -r /var/www/html/public/* /var/www/html/
fi

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