# CI/CD Pipeline Demo

This repository contains a simple web application and CloudFormation templates to set up a complete CI/CD pipeline using AWS services.

## Architecture

The CI/CD pipeline uses the following AWS services:
- AWS CodePipeline
- AWS CodeBuild
- AWS CodeDeploy
- Amazon S3
- AWS IAM

## Directory Structure

```
.
├── WebApp/
│   ├── buildspec.yml       # Build specification for CodeBuild
│   ├── appspec.yml         # Application specification for CodeDeploy
│   ├── index.html          # Sample web application
│   ├── scripts/            # Deployment scripts for CodeDeploy
│   └── cfn/                # CloudFormation templates
│       ├── master.yaml     # Master template that orchestrates all resources
│       ├── s3-bucket.yaml  # S3 bucket for artifacts
│       ├── iam-roles.yaml  # IAM roles for CI/CD services
│       ├── codebuild.yaml  # CodeBuild project
│       ├── codedeploy.yaml # CodeDeploy application and deployment group
│       ├── codepipeline.yaml # CodePipeline configuration
│       └── deploy-templates.sh # Script to deploy templates to S3
```

## Deployment Instructions

1. Upload the CloudFormation templates to an S3 bucket:

```bash
cd WebApp/cfn
./deploy-templates.sh your-bucket-name
```

2. Deploy the master CloudFormation stack:

```bash
aws cloudformation create-stack \
  --stack-name cicd-pipeline \
  --template-url https://s3.amazonaws.com/your-bucket-name/master.yaml \
  --parameters \
    ParameterKey=S3TemplateURL,ParameterValue=https://s3.amazonaws.com/your-bucket-name \
    ParameterKey=AutoScalingGroupName,ParameterValue=your-asg-name \
    ParameterKey=CodeStarConnectionArn,ParameterValue=your-codestar-connection-arn \
  --capabilities CAPABILITY_IAM
```

## Prerequisites

- AWS CLI configured with appropriate permissions
- An Auto Scaling Group for deployment targets
- A CodeStar Connection to GitHub