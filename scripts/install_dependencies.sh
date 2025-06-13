#!/bin/bash
# Install dependencies for Node.js application
# Updated for 2025 deployment

echo "Installing dependencies for WebApp"

# Detect OS
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$NAME
else
  OS=$(uname -s)
fi

# Install dependencies based on OS
if [[ "$OS" == *"Ubuntu"* ]]; then
  echo "Detected Ubuntu system"
  
  # Update package lists
  apt-get update
  
  # Install Node.js dependencies
  apt-get install -y git wget curl
  
  # Install Nginx
  apt-get install -y nginx
  
  # Setup Node.js (using version 20.x)
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  
  # Install PM2
  npm install -g pm2
  
  # Install CodeDeploy agent
  apt-get install -y ruby-full
  cd /tmp
  wget https://aws-codedeploy-us-east-1.s3.amazonaws.com/latest/install
  chmod +x ./install
  ./install auto
  systemctl start codedeploy-agent
  systemctl enable codedeploy-agent
  
elif [[ "$OS" == *"Amazon"* ]] || [[ -f /etc/system-release && $(cat /etc/system-release) == *"Amazon"* ]]; then
  echo "Detected Amazon Linux system"
  
  # Update package lists
  yum update -y
  
  # Install Node.js dependencies
  yum install -y git wget curl
  
  # Install Nginx
  amazon-linux-extras install -y nginx1
  
  # Setup Node.js (using version 20.x)
  curl -sL https://rpm.nodesource.com/setup_20.x | bash -
  yum install -y nodejs
  
  # Install PM2
  npm install -g pm2
  
  # Install CodeDeploy agent
  yum install -y ruby
  cd /tmp
  wget https://aws-codedeploy-us-east-1.s3.amazonaws.com/latest/install
  chmod +x ./install
  ./install auto
  systemctl start codedeploy-agent
  systemctl enable codedeploy-agent
  
else
  echo "Unsupported operating system: $OS"
  exit 1
fi

# Detect user and set application directory
if id "ubuntu" &>/dev/null; then
  APP_USER="ubuntu"
  APP_DIR="/home/ubuntu/node-website"
else
  APP_USER="ec2-user"
  APP_DIR="/home/ec2-user/node-website"
fi

echo "Setting up application for user: $APP_USER"

# Create application directory
mkdir -p $APP_DIR

# Set proper ownership
chown -R $APP_USER:$APP_USER $APP_DIR

echo "Dependencies installation completed"