#!/bin/bash
# Validate service script for Node.js application
# Updated for 2025 deployment

# Detect user and set application directory
if id "ubuntu" &>/dev/null; then
  APP_USER="ubuntu"
  PM2_HOME="/home/ubuntu/.pm2"
else
  APP_USER="ec2-user"
  PM2_HOME="/home/ec2-user/.pm2"
fi

echo "Validating WebApp service for user: $APP_USER"

# Check if PM2 is running
if command -v pm2 &> /dev/null; then
  echo "Checking PM2 processes:"
  if sudo -u $APP_USER PM2_HOME=$PM2_HOME pm2 list | grep webapp; then
    echo "PM2 process found"
  else
    echo "PM2 process not found, service may not be running"
    exit 1
  fi
else
  echo "PM2 not installed, cannot validate PM2 service"
  exit 1
fi

# Check if application is responding on port 3000
echo "Testing direct application response:"
if curl -s http://localhost:3000 > /dev/null; then
  echo "Application is responding on port 3000"
else
  echo "Application is not responding on port 3000"
  echo "Checking PM2 logs:"
  sudo -u $APP_USER PM2_HOME=$PM2_HOME pm2 logs --lines 10
  exit 1
fi

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
  echo "Nginx is running"
else
  echo "Nginx is not running"
  echo "Starting Nginx..."
  systemctl start nginx
fi

# Check if application is responding through Nginx
echo "Testing Nginx proxy response:"
if curl -s http://localhost > /dev/null; then
  echo "Application is responding through Nginx on port 80"
else
  echo "Application is not responding through Nginx"
  echo "Checking Nginx error logs:"
  tail -n 20 /var/log/nginx/error.log
  exit 1
fi

echo "Service validation successful"
exit 0