#!/bin/bash

# Check if httpd is installed
if command -v httpd &> /dev/null || systemctl list-unit-files | grep -q httpd.service; then
  echo "Starting httpd service..."
  systemctl start httpd || true
  systemctl enable httpd || true
else
  echo "httpd service not found, skipping httpd start"
fi

# Start Node.js application if it exists
if [ -f /var/www/html/app.js ]; then
  echo "Starting Node.js application..."
  cd /var/www/html
  nohup node app.js > app.log 2>&1 &
  echo "Node.js application started"
fi

# Always exit with success to prevent deployment failures
exit 0