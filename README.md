# Modern Web Application Deployment (2025)

This repository contains a complete CI/CD pipeline for deploying a modern web application to AWS. The application is a simple Node.js web server that can be deployed to EC2 instances running Ubuntu or Amazon Linux.

## Repository Structure

```
WebApp/
├── app.js                  # Main application file
├── appspec.yml             # AWS CodeDeploy configuration
├── buildspec.yml           # AWS CodeBuild configuration
├── package.json            # Node.js package configuration
├── cfn/                    # CloudFormation templates
│   ├── codebuild.yaml      # CodeBuild project template
│   ├── codedeploy.yaml     # CodeDeploy application and deployment group template
│   ├── codepipeline.yaml   # CodePipeline template
│   ├── iam-roles.yaml      # IAM roles for CI/CD services
│   ├── master.yaml         # Master template that orchestrates all others
│   └── s3-bucket.yaml      # S3 bucket for artifacts
└── scripts/                # Deployment scripts
    ├── beforeInstall.sh    # Script to run before installation
    ├── install_dependencies.sh # Script to install dependencies
    ├── start_server.sh     # Script to start the application
    ├── stop_server.sh      # Script to stop the application
    └── validate_service.sh # Script to validate the deployment
```

## Prerequisites

1. AWS Account with permissions to create:
   - CloudFormation stacks
   - IAM roles
   - S3 buckets
   - CodeBuild projects
   - CodeDeploy applications
   - CodePipeline pipelines

2. GitHub account with:
   - This repository forked or cloned
   - OAuth token for AWS CodePipeline integration

3. EC2 instances or Auto Scaling Group with:
   - Ubuntu 22.04 or Amazon Linux 2023
   - IAM role with permissions for CodeDeploy agent
   - Security group allowing HTTP (port 80) and SSH (port 22)

## Deployment Instructions

### Step 1: Create a GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `repo` and `admin:repo_hook` permissions
3. Save the token securely (you'll need it for Step 3)

### Step 2: Store the GitHub Token in AWS Secrets Manager

1. Go to AWS Secrets Manager console
2. Create a new secret
   - Secret type: Other type of secret
   - Key/value pairs: Key = `token`, Value = your GitHub token
   - Secret name: `GitHubToken`
3. Keep all other settings default and create the secret

### Step 3: Deploy the CloudFormation Templates

#### Option 1: Deploy using the Master Template

1. Go to AWS CloudFormation console
2. Create a new stack with new resources
3. Upload the `master.yaml` template or specify its S3 URL
4. Fill in the parameters:
   - ProjectName: Base name for all resources (e.g., `webapp`)
   - RepositoryName: Your GitHub repository name (e.g., `cicd-demo`)
   - RepositoryOwner: Your GitHub username
   - BranchName: The branch to build from (e.g., `main`)
   - AutoScalingGroupName: The name of your Auto Scaling Group
5. Create the stack and wait for completion

#### Option 2: Deploy Individual Templates

If you prefer to deploy the templates individually, follow this order:

1. Deploy `s3-bucket.yaml`
2. Deploy `iam-roles.yaml` (using the S3 bucket name from step 1)
3. Deploy `codebuild.yaml` (using the CodeBuild role ARN from step 2)
4. Deploy `codedeploy.yaml` (using the CodeDeploy role ARN from step 2)
5. Deploy `codepipeline.yaml` (using outputs from steps 1-4)

### Step 4: Verify the Deployment

1. Go to AWS CodePipeline console
2. Find your pipeline (named `{ProjectName}-pipeline`)
3. Verify that the pipeline is running successfully
4. Once the pipeline completes, check your EC2 instances:
   - SSH into an instance: `ssh ubuntu@your-instance-ip` or `ssh ec2-user@your-instance-ip`
   - Check if the application is running: `sudo systemctl status nginx` and `pm2 list`
   - Test the application: `curl http://localhost`

## Manual Instance Setup

If you need to set up instances manually without CodeDeploy:

### For Ubuntu instances:

```bash
sudo bash setup-ubuntu.sh
```

### For Amazon Linux instances:

```bash
sudo bash setup-amazon-linux.sh
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway Error**:
   - Check if the Node.js application is running: `pm2 list`
   - Check Nginx configuration: `sudo nginx -t`
   - Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

2. **CodeDeploy Deployment Failures**:
   - Check CodeDeploy agent status: `sudo systemctl status codedeploy-agent`
   - Check deployment logs: `/var/log/aws/codedeploy-agent/codedeploy-agent.log`

3. **PM2 Service Not Starting**:
   - Check PM2 logs: `pm2 logs`
   - Manually start the application: `cd /home/ubuntu/node-website && pm2 start app.js`

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

* AWS Documentation
* Node.js community
* PM2 documentation