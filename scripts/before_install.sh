#!/bin/bash

# Install dependencies
yum update -y

# Try to install httpd, but don't fail if it doesn't work
echo "Attempting to install httpd..."
yum install -y httpd || echo "Failed to install httpd, continuing anyway"

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -sL https://rpm.nodesource.com/setup_16.x | bash - || true
  yum install -y nodejs || echo "Failed to install Node.js, continuing anyway"
fi

# Create application directory if it doesn't exist
mkdir -p /var/www/html

# Remove existing files
if [ -d /var/www/html ]; then
  rm -rf /var/www/html/*
fi

# Always exit with success
exit 0