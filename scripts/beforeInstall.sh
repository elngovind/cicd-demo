#!/bin/bash

# Updated for 2025 deployment - Works with both Ubuntu and Amazon Linux

# Detect OS and set appropriate user
if grep -q "ubuntu" /etc/passwd; then
  APP_USER="ubuntu"
  APP_DIR="/home/ubuntu/node-website"
else
  APP_USER="ec2-user"
  APP_DIR="/home/ec2-user/node-website"
fi

echo "Using application directory: $APP_DIR for user: $APP_USER"

# Clean up previous deployment
if [ -d "$APP_DIR" ]; then
  echo "Removing existing application directory"
  rm -rf "$APP_DIR"
fi

# Create fresh directory
echo "Creating application directory"
mkdir -vp "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo "beforeInstall script completed"