#!/bin/bash

# Ubuntu-specific after-install script
echo "Running Ubuntu-specific after-install script"

# Navigate to application directory
cd /var/www/html

# Install dependencies if package.json exists
if [ -f package.json ]; then
  echo "Installing Node.js dependencies..."
  npm install --production
fi

# Set proper permissions
chmod -R 755 /var/www/html

# Always exit with success
exit 0