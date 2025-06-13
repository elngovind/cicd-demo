#!/bin/bash -xe
# Amazon Linux setup script for WebApp instances
# Run as root: sudo bash setup-amazon-linux.sh

# Update system and install dependencies
yum update -y
yum install -y git ruby wget

# Install latest AWS CFN tools
yum install -y aws-cfn-bootstrap

# Setup application directory
mkdir -p /home/ec2-user/node-website

# Setup Node.js (using version 20.x - change if needed)
curl -sL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
npm install -g pm2

# Create a simple test app
cat > /home/ec2-user/node-website/app.js << 'EOF'
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello from WebApp (2025)!');
}).listen(80);
EOF

# Set permissions
chown -R ec2-user:ec2-user /home/ec2-user/node-website
chmod 755 /home/ec2-user/node-website/app.js

# Start application
cd /home/ec2-user/node-website
sudo -E PM2_HOME=/home/ec2-user/.pm2 -u ec2-user pm2 start app.js

# Install CodeDeploy agent
cd /home/ec2-user/
wget https://aws-codedeploy-us-east-1.s3.amazonaws.com/latest/install
chmod +x ./install
./install auto
systemctl start codedeploy-agent

# Save PM2 process list so it starts on reboot
sudo -u ec2-user PM2_HOME=/home/ec2-user/.pm2 pm2 save
sudo -u ec2-user PM2_HOME=/home/ec2-user/.pm2 pm2 startup | tail -n 1 | bash