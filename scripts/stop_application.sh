#!/bin/bash

# Ubuntu-specific stop script
echo "Running Ubuntu-specific stop script"

# Stop Node.js application if PM2 is installed
if command -v pm2 &> /dev/null; then
  echo "Stopping Node.js application with PM2..."
  pm2 stop app 2>/dev/null || true
  echo "Node.js application stopped"
else
  echo "PM2 not installed, checking for running Node.js processes"
  # Check if Node.js application is running and stop it
  if pgrep -f "node app.js" > /dev/null; then
    echo "Stopping Node.js application..."
    pkill -f "node app.js" || true
    echo "Node.js application stopped"
  else
    echo "No running Node.js application found"
  fi
fi

# Always exit with success
exit 0