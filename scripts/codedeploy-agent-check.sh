#!/bin/bash

# Script to check and fix CodeDeploy agent issues
# This can be run manually on instances where deployments are failing

echo "Checking CodeDeploy agent status..."

# Check if agent is installed
if ! command -v codedeploy-agent &> /dev/null; then
    echo "CodeDeploy agent not found. Installing..."
    
    # Install required packages
    sudo yum install -y ruby wget
    
    # Get region from instance metadata
    REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
    
    # Download and install agent
    cd /home/ec2-user
    wget https://aws-codedeploy-$REGION.s3.amazonaws.com/latest/install
    chmod +x ./install
    sudo ./install auto
else
    echo "CodeDeploy agent is installed."
fi

# Check agent status
echo "Checking agent status..."
if sudo service codedeploy-agent status | grep -q "running"; then
    echo "CodeDeploy agent is running."
else
    echo "CodeDeploy agent is not running. Attempting to start..."
    sudo service codedeploy-agent restart
    
    # Check if it started successfully
    if sudo service codedeploy-agent status | grep -q "running"; then
        echo "Successfully started CodeDeploy agent."
    else
        echo "Failed to start CodeDeploy agent. Checking logs..."
    fi
fi

# Check for common issues
echo "Checking for common issues..."

# Check log file
if [ -f /var/log/aws/codedeploy-agent/codedeploy-agent.log ]; then
    echo "Recent log entries:"
    tail -n 50 /var/log/aws/codedeploy-agent/codedeploy-agent.log
else
    echo "CodeDeploy agent log file not found."
fi

# Check if agent can connect to service
echo "Testing connection to CodeDeploy service..."
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
if curl -s https://codedeploy.$REGION.amazonaws.com > /dev/null; then
    echo "Connection to CodeDeploy service successful."
else
    echo "Cannot connect to CodeDeploy service. Check network/security group settings."
fi

# Check IAM role
echo "Checking instance IAM role..."
ROLE=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/)
if [ -z "$ROLE" ]; then
    echo "No IAM role attached to this instance. CodeDeploy requires an IAM role."
else
    echo "Instance has IAM role: $ROLE"
fi

# Fix permissions for deployment root
echo "Fixing permissions for deployment root..."
sudo mkdir -p /opt/codedeploy-agent/deployment-root
sudo chmod -R 755 /opt/codedeploy-agent/deployment-root

echo "CodeDeploy agent check complete."