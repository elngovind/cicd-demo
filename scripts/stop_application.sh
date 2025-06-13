#!/bin/bash

# Check if httpd is running and stop it if it is
if systemctl is-active httpd &>/dev/null; then
  echo "Stopping httpd service..."
  systemctl stop httpd
  echo "httpd service stopped"
else
  echo "httpd service is not running"
fi

# Check if Node.js application is running and stop it
if pgrep -f "node app.js" > /dev/null; then
  echo "Stopping Node.js application..."
  pkill -f "node app.js"
  echo "Node.js application stopped"
else
  echo "Node.js application is not running"
fi

# Always exit with success to prevent deployment failures
exit 0