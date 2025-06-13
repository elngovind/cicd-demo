#!/bin/bash

# Ubuntu-specific installation script
echo "Running Ubuntu-specific installation script"

# Update package lists
apt-get update -y

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
  apt-get install -y nodejs
fi

# Create application directory if it doesn't exist
mkdir -p /var/www/html

# Remove existing files
if [ -d /var/www/html ]; then
  rm -rf /var/www/html/*
fi

# Set proper permissions
chmod -R 755 /var/www/html

# Always exit with success
exit 0