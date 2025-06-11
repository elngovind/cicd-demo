#!/bin/bash
# Stop script for Node.js application managed by PM2
# Updated for 2025 deployment

# Detect user and set application directory
if id "ubuntu" &>/dev/null; then
  APP_USER="ubuntu"
  PM2_HOME="/home/ubuntu/.pm2"
else
  APP_USER="ec2-user"
  PM2_HOME="/home/ec2-user/.pm2"
fi

echo "Stopping application for user: $APP_USER"

# Check if PM2 is running
if command -v pm2 &> /dev/null; then
  echo "Stopping Node.js application with PM2"
  # Stop all PM2 processes
  sudo -u $APP_USER PM2_HOME=$PM2_HOME pm2 stop all || true
else
  echo "PM2 not found, checking for Node.js processes"
  # Fallback to killing Node.js processes directly
  if (( $(ps -ef | grep -v grep | grep node | wc -l) > 0 )); then
    echo "Killing Node.js processes"
    killall node || true
  fi
fi

# Stop Nginx if it's running
if systemctl is-active --quiet nginx; then
  echo "Stopping Nginx"
  systemctl stop nginx
fi

echo "Stop script completed"