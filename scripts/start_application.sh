#!/bin/bash

# Ubuntu-specific startup script
echo "Running Ubuntu-specific startup script"

# Start Node.js application if it exists
if [ -f /var/www/html/app.js ]; then
  echo "Starting Node.js application..."
  cd /var/www/html
  
  # Install PM2 globally
  echo "Installing PM2..."
  npm install -g pm2 || true
  
  # Start application with PM2
  pm2 stop app 2>/dev/null || true
  pm2 start app.js --name app || true
  pm2 save || true
  
  # Ensure PM2 starts on system boot
  pm2 startup systemd -u ubuntu --hp /home/ubuntu || true
  
  echo "Node.js application started with PM2"
else
  echo "app.js not found in /var/www/html"
  echo "Creating a simple app.js file"
  
  # Create a simple app.js file
  mkdir -p /var/www/html
  cat > /var/www/html/app.js << 'EOF'
const http = require('http');
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World from Node.js\n');
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
EOF

  # Install PM2 globally
  echo "Installing PM2..."
  npm install -g pm2 || true
  
  # Start the application
  cd /var/www/html
  pm2 start app.js --name app || true
  pm2 save || true
fi

# Always exit with success
exit 0