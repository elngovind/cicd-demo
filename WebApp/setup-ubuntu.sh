#!/bin/bash -xe
# Ubuntu 22.04 setup script for WebApp instances
# Run as root: sudo bash setup-ubuntu.sh

# Update system and install dependencies
apt-get update
apt-get install -y git wget curl nginx

# Setup application directory
mkdir -p /home/ubuntu/node-website

# Setup Node.js (using version 20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Create a simple test app with proper logging
cat > /home/ubuntu/node-website/app.js << 'EOF'
var http = require('http');
var server = http.createServer(function (req, res) {
  console.log("Received request:", req.url);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello from WebApp (2025)!');
});

server.listen(3000, '0.0.0.0', function() {
  console.log('Server listening on port 3000');
});
EOF

# Set permissions
chown -R ubuntu:ubuntu /home/ubuntu/node-website
chmod 755 /home/ubuntu/node-website/app.js

# Configure Nginx as reverse proxy
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
}
EOF

# Test Nginx configuration
nginx -t

# Restart Nginx more forcefully
systemctl stop nginx
systemctl start nginx

# Check if Nginx is listening on port 80
netstat -tulpn | grep :80

# Check Nginx error logs
tail -n 20 /var/log/nginx/error.log

# Start application as ubuntu user
cd /home/ubuntu/node-website
sudo -u ubuntu PM2_HOME=/home/ubuntu/.pm2 pm2 start app.js --name webapp

# Verify app is running
sleep 2
sudo -u ubuntu PM2_HOME=/home/ubuntu/.pm2 pm2 list

# Save PM2 process list
sudo -u ubuntu PM2_HOME=/home/ubuntu/.pm2 pm2 save

# Setup PM2 to start on boot
startup_cmd=$(sudo -u ubuntu PM2_HOME=/home/ubuntu/.pm2 pm2 startup systemd -u ubuntu --hp /home/ubuntu | grep "sudo" | sed -e "s/\[PM2\] //")
eval $startup_cmd

# Start and enable the PM2 service
systemctl daemon-reload
systemctl start pm2-ubuntu
systemctl enable pm2-ubuntu

# Install CodeDeploy agent for Ubuntu
apt-get install -y ruby-full
cd /home/ubuntu/
wget https://aws-codedeploy-us-east-1.s3.amazonaws.com/latest/install
chmod +x ./install
./install auto
systemctl start codedeploy-agent

# Final verification
echo "Testing app through Nginx:"
curl -s http://localhost
echo ""
echo "Setup complete!"