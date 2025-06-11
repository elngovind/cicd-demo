# CI/CD Demo for Modern Web Applications (2025)

This repository contains a complete CI/CD pipeline for deploying modern web applications to AWS. It includes CloudFormation templates for setting up the entire infrastructure and deployment pipeline.

## Repository Structure

```
.
└── WebApp/                 # Web application project
    ├── app.js              # Main application file
    ├── appspec.yml         # AWS CodeDeploy configuration
    ├── buildspec.yml       # AWS CodeBuild configuration
    ├── package.json        # Node.js package configuration
    ├── cfn/                # CloudFormation templates
    │   ├── codebuild.yaml  # CodeBuild project template
    │   ├── codedeploy.yaml # CodeDeploy application and deployment group template
    │   ├── codepipeline.yaml # CodePipeline template
    │   ├── iam-roles.yaml  # IAM roles for CI/CD services
    │   ├── master.yaml     # Master template that orchestrates all others
    │   └── s3-bucket.yaml  # S3 bucket for artifacts
    ├── scripts/            # Deployment scripts
    │   ├── beforeInstall.sh # Script to run before installation
    │   ├── install_dependencies.sh # Script to install dependencies
    │   ├── start_server.sh # Script to start the application
    │   ├── stop_server.sh  # Script to stop the application
    │   └── validate_service.sh # Script to validate the deployment
    └── setup-ubuntu.sh     # Manual setup script for Ubuntu instances
```

## Quick Start

For detailed instructions, see the [WebApp README](WebApp/README.md).

### Deploy the CI/CD Pipeline

#### Using AWS CLI

1. Create a GitHub Personal Access Token
2. Store the token in AWS Secrets Manager as `GitHubToken`
3. Deploy the master CloudFormation template:
   ```
   aws cloudformation create-stack \
     --stack-name webapp-cicd \
     --template-body file://WebApp/cfn/master.yaml \
     --parameters \
       ParameterKey=ProjectName,ParameterValue=webapp \
       ParameterKey=RepositoryName,ParameterValue=cicd-demo \
       ParameterKey=RepositoryOwner,ParameterValue=elngovind \
       ParameterKey=BranchName,ParameterValue=main \
       ParameterKey=AutoScalingGroupName,ParameterValue=your-asg-name \
     --capabilities CAPABILITY_IAM
   ```

#### Using AWS Console

For step-by-step instructions on deploying through the AWS Management Console, see the [Console Deployment Guide](WebApp/CONSOLE_DEPLOYMENT.md).

### Manual Instance Setup

For Ubuntu instances:
```bash
sudo bash WebApp/setup-ubuntu.sh
```

For Amazon Linux instances:
```bash
sudo bash WebApp/setup-amazon-linux.sh
```

## Features

- **Complete CI/CD Pipeline**: Source, Build, Deploy stages
- **Infrastructure as Code**: All resources defined in CloudFormation
- **Cross-Platform Support**: Works on both Ubuntu and Amazon Linux
- **Modern Web Stack**: Node.js with Express, PM2, and Nginx
- **Secure by Default**: IAM roles with least privilege, encrypted S3 buckets

## License

This project is licensed under the ISC License - see the LICENSE file for details.