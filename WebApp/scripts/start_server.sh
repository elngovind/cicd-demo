#!/bin/bash
# Start script for Node.js application managed by PM2
# Updated for 2025 deployment

# Detect user and set application directory
if id "ubuntu" &>/dev/null; then
  APP_USER="ubuntu"
  APP_DIR="/home/ubuntu/node-website"
  PM2_HOME="/home/ubuntu/.pm2"
else
  APP_USER="ec2-user"
  APP_DIR="/home/ec2-user/node-website"
  PM2_HOME="/home/ec2-user/.pm2"
fi

echo "Starting application for user: $APP_USER in directory: $APP_DIR"

# Set environment variables
export HOME="/home/$APP_USER"
export PM2_HOME="$PM2_HOME"

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
  echo "Creating application directory"
  mkdir -p $APP_DIR
fi

# Check if app.js exists, create if not
if [ ! -f "$APP_DIR/app.js" ]; then
  echo "Creating default app.js"
  cat > $APP_DIR/app.js << 'EOF'
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
  chown $APP_USER:$APP_USER $APP_DIR/app.js
  chmod 755 $APP_DIR/app.js
fi

# Start application with PM2
echo "Starting Node.js application with PM2"
if command -v pm2 &> /dev/null; then
  cd $APP_DIR
  sudo -u $APP_USER PM2_HOME=$PM2_HOME pm2 start app.js --name webapp || sudo -u $APP_USER PM2_HOME=$PM2_HOME pm2 restart webapp
  sudo -u $APP_USER PM2_HOME=$PM2_HOME pm2 save
else
  echo "PM2 not found, installing..."
  npm install -g pm2
  cd $APP_DIR
  sudo -u $APP_USER PM2_HOME=$PM2_HOME pm2 start app.js --name webapp
  sudo -u $APP_USER PM2_HOME=$PM2_HOME pm2 save
  
  # Setup PM2 startup script
  startup_cmd=$(sudo -u $APP_USER PM2_HOME=$PM2_HOME pm2 startup systemd -u $APP_USER --hp /home/$APP_USER | grep "sudo" | sed -e "s/\[PM2\] //")
  eval $startup_cmd
  systemctl daemon-reload
  systemctl enable pm2-$APP_USER
fi

# Start Nginx if it's installed
if command -v nginx &> /dev/null; then
  echo "Starting Nginx"
  # Check if Nginx config exists for our app
  if [ ! -f "/etc/nginx/sites-available/default" ] || ! grep -q "proxy_pass http://127.0.0.1:3000" "/etc/nginx/sites-available/default"; then
    echo "Creating Nginx configuration"
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
  fi
  
  # Test and start Nginx
  nginx -t
  systemctl start nginx
fi

# Verify application is running
echo "Verifying application status:"
if command -v pm2 &> /dev/null; then
  sudo -u $APP_USER PM2_HOME=$PM2_HOME pm2 list
fi

# Check if application is responding
echo "Testing application response:"
curl -s http://localhost:3000 || echo "Application not responding on port 3000"
curl -s http://localhost || echo "Application not responding on port 80 (Nginx)"

echo "Start script completed"