#!/bin/bash

# Ubuntu-specific validation script
echo "Running Ubuntu-specific validation script"

# Check if PM2 is running the application
if command -v pm2 &> /dev/null; then
  echo "Checking PM2 processes:"
  if pm2 list | grep -q "app"; then
    echo "PM2 process found"
  else
    echo "PM2 process not found, service may not be running"
    exit 1
  fi
else
  echo "PM2 not installed, checking for Node.js process"
  if pgrep -f "node app.js" > /dev/null; then
    echo "Node.js process found"
  else
    echo "Node.js process not found, service may not be running"
    exit 1
  fi
fi

# Check if application is responding on port 3000
echo "Testing application response:"
if curl -s http://localhost:3000 > /dev/null; then
  echo "Application is responding on port 3000"
else
  echo "Application is not responding on port 3000"
  exit 1
fi

echo "Service validation successful"
exit 0