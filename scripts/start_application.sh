#!/bin/bash

# Ubuntu-specific startup script
echo "Running Ubuntu-specific startup script"

# Start Node.js application if it exists
if [ -f /var/www/html/app.js ]; then
  echo "Starting Node.js application..."
  cd /var/www/html
  
  # Install PM2 if not already installed
  if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
  fi
  
  # Start application with PM2
  pm2 stop app 2>/dev/null || true
  pm2 start app.js --name app
  pm2 save
  
  # Ensure PM2 starts on system boot
  pm2 startup systemd -u ubuntu --hp /home/ubuntu || true
  
  echo "Node.js application started with PM2"
else
  echo "app.js not found in /var/www/html"
fi

# Always exit with success
exit 0