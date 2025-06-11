#!/bin/bash -xe
# Script to fix PM2 service issues on Ubuntu

# Stop services
sudo systemctl stop pm2-ubuntu
sudo systemctl stop nginx

# Check if Node.js app is running on port 3000
netstat -tulpn | grep 3000 || echo "No process on port 3000"

# Create a simple test app that explicitly logs when it starts
sudo cat > /home/ubuntu/node-website/app.js << 'EOF'
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

# Fix permissions
sudo chown ubuntu:ubuntu /home/ubuntu/node-website/app.js
sudo chmod 755 /home/ubuntu/node-website/app.js

# Clear existing PM2 processes
sudo -u ubuntu PM2_HOME=/home/ubuntu/.pm2 pm2 delete all || true

# Start app with correct user and make sure it's running in foreground mode
cd /home/ubuntu/node-website
sudo -u ubuntu PM2_HOME=/home/ubuntu/.pm2 pm2 start app.js --name webapp

# Verify app is running
sleep 2
sudo -u ubuntu PM2_HOME=/home/ubuntu/.pm2 pm2 list
sudo -u ubuntu PM2_HOME=/home/ubuntu/.pm2 pm2 logs --lines 5

# Test direct access to the app
curl -v http://localhost:3000 || echo "App not responding on port 3000"

# Save process list
sudo -u ubuntu PM2_HOME=/home/ubuntu/.pm2 pm2 save

# Configure Nginx with more detailed logging
sudo cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log debug;

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
sudo nginx -t

# Restart Nginx more forcefully
sudo systemctl stop nginx
sudo systemctl start nginx

# Check if Nginx is listening on port 80
sudo netstat -tulpn | grep :80

# Check Nginx error logs
sudo tail -n 20 /var/log/nginx/error.log

# Recreate PM2 startup script
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 unstartup systemd -u ubuntu --hp /home/ubuntu || true
startup_cmd=$(sudo -u ubuntu PM2_HOME=/home/ubuntu/.pm2 pm2 startup systemd -u ubuntu --hp /home/ubuntu | grep "sudo" | sed -e "s/\[PM2\] //")
eval $startup_cmd

# Start PM2 service
sudo systemctl daemon-reload
sudo systemctl start pm2-ubuntu
sudo systemctl enable pm2-ubuntu

# Final verification
echo "Testing app through Nginx:"
curl -v http://localhost

# Check logs if there's still an issue
echo "Nginx error log:"
tail /var/log/nginx/error.log