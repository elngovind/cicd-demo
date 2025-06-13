# CI/CD Pipeline Demo

This repository contains a simple web application and CloudFormation templates to set up a complete CI/CD pipeline using AWS services.

## Architecture

The CI/CD pipeline uses the following AWS services:
- AWS CodePipeline - Orchestrates the pipeline workflow
- AWS CodeBuild - Builds and tests the application
- AWS CodeDeploy - Deploys the application to EC2 instances
- Amazon S3 - Stores artifacts and templates
- AWS IAM - Manages permissions and roles

## Repository Structure

```
.
├── cfn/                # CloudFormation templates
│   ├── master.yaml     # Master template that orchestrates all resources
│   ├── s3-bucket.yaml  # S3 bucket for artifacts
│   ├── iam-roles.yaml  # IAM roles for CI/CD services
│   ├── codebuild.yaml  # CodeBuild project
│   ├── codedeploy.yaml # CodeDeploy application and deployment group
│   ├── codepipeline.yaml # CodePipeline configuration
│   └── deploy-templates.sh # Script to deploy templates to S3
├── scripts/            # Deployment scripts for CodeDeploy
├── public/             # Static web assets
├── buildspec.yml       # Build specification for CodeBuild
├── appspec.yml         # Application specification for CodeDeploy
└── index.html          # Sample web application
```

## Deployment Instructions

### 1. CloudFormation-Based Deployment (Recommended)

#### Prerequisites
- An Auto Scaling Group for deployment targets
- A CodeStar Connection to GitHub

#### Option A: AWS Console Deployment

##### Step 1: Deploy the Core Infrastructure Template
1. Go to AWS Console > CloudFormation > Stacks
2. Click "Create stack" > "With new resources (standard)"
3. Select "Upload a template file" and upload the `cfn/template-bucket.yaml` file
4. Click "Next"
5. Enter stack name: `template-bucket-stack`
6. Specify parameters:
   - BucketName: A globally unique name for your template bucket
7. Click "Next", then "Next" again
8. Click "Create stack"
9. Wait for the stack to complete and note the bucket name from the Outputs tab

##### Step 2: Upload Templates to S3
1. Go to AWS Console > S3
2. Find the bucket created in Step 1
3. Upload all CloudFormation templates from the `cfn/` directory to this bucket

##### Step 2: Create CodeStar Connection
1. Go to AWS Console > Developer Tools > Settings > Connections
2. Click "Create connection"
3. Select "GitHub" as the provider
4. Follow the prompts to connect to your GitHub account
5. Note the ARN of the created connection

##### Step 3: Deploy the Master Stack
1. Go to AWS Console > CloudFormation > Stacks
2. Click "Create stack" > "With new resources (standard)"
3. Select "Amazon S3 URL" and enter the URL to your master.yaml template:
   `https://s3.amazonaws.com/your-bucket-name/master.yaml`
4. Click "Next"
5. Enter stack name: `cicd-pipeline`
6. Specify parameters:
   - ProjectName: Name for your project resources
   - RepositoryName: `cicd-demo`
   - RepositoryOwner: Your GitHub username
   - BranchName: `main`
   - AutoScalingGroupName: Name of your existing Auto Scaling Group
   - S3TemplateURL: `https://s3.amazonaws.com/your-bucket-name`
   - CodeStarConnectionArn: ARN of your GitHub connection
7. Click "Next"
8. Add any tags if desired and click "Next"
9. Check "I acknowledge that AWS CloudFormation might create IAM resources"
10. Click "Create stack"

##### Step 4: Monitor Deployment
1. On the CloudFormation console, monitor the stack creation progress
2. Once complete, check the "Outputs" tab for resource names
3. The pipeline will automatically start once the stack is created

#### Option B: AWS CLI Deployment

##### Step 1: Deploy the Core Infrastructure Template
```bash
aws cloudformation create-stack \
  --stack-name template-bucket-stack \
  --template-body file://cfn/template-bucket.yaml \
  --parameters ParameterKey=BucketName,ParameterValue=your-unique-template-bucket-name
```

Wait for the stack to complete:
```bash
aws cloudformation wait stack-create-complete --stack-name template-bucket-stack
```

##### Step 2: Upload Templates to S3
```bash
cd cfn
./deploy-templates.sh your-template-bucket-name
```

##### Step 2: Create CodeStar Connection (if not already created)
1. Go to AWS Console > Developer Tools > Settings > Connections
2. Click "Create connection"
3. Select "GitHub" as the provider
4. Follow the prompts to connect to your GitHub account
5. Note the ARN of the created connection

##### Step 3: Deploy the Master Stack
```bash
aws cloudformation create-stack \
  --stack-name cicd-pipeline \
  --template-url https://s3.amazonaws.com/your-template-bucket-name/master.yaml \
  --parameters \
    ParameterKey=S3TemplateURL,ParameterValue=https://s3.amazonaws.com/your-template-bucket-name \
    ParameterKey=AutoScalingGroupName,ParameterValue=your-asg-name \
    ParameterKey=CodeStarConnectionArn,ParameterValue=your-codestar-connection-arn \
  --capabilities CAPABILITY_IAM
```

##### Step 4: Monitor Deployment
1. Go to AWS Console > CloudFormation
2. Select the `cicd-pipeline` stack
3. Monitor the "Events" tab for deployment progress
4. Once complete, check the "Outputs" tab for resource names

### 2. CLI-Based Manual Deployment

#### Step 1: Create S3 Bucket for Artifacts
```bash
aws s3api create-bucket \
  --bucket your-artifacts-bucket-name \
  --region your-region \
  $([ "your-region" != "us-east-1" ] && echo "--create-bucket-configuration LocationConstraint=your-region")

aws s3api put-bucket-versioning \
  --bucket your-artifacts-bucket-name \
  --versioning-configuration Status=Enabled
```

#### Step 2: Create IAM Roles
Create the necessary IAM roles for CodeBuild, CodeDeploy, and CodePipeline using the policies defined in `cfn/iam-roles.yaml`.

#### Step 3: Create CodeBuild Project
```bash
aws codebuild create-project \
  --name your-project-name \
  --source type=GITHUB,location=https://github.com/your-username/cicd-demo.git \
  --artifacts type=S3,location=your-artifacts-bucket-name,name=BuildOutput \
  --environment type=LINUX_CONTAINER,compute-type=BUILD_GENERAL1_SMALL,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0 \
  --service-role your-codebuild-service-role-arn
```

#### Step 4: Create CodeDeploy Application and Deployment Group
```bash
aws deploy create-application \
  --application-name your-application-name

aws deploy create-deployment-group \
  --application-name your-application-name \
  --deployment-group-name your-deployment-group-name \
  --deployment-config-name CodeDeployDefault.OneAtATime \
  --auto-scaling-groups your-asg-name \
  --service-role-arn your-codedeploy-service-role-arn
```

#### Step 5: Create CodePipeline
```bash
aws codepipeline create-pipeline \
  --pipeline-name your-pipeline-name \
  --role-arn your-codepipeline-service-role-arn \
  --artifact-store type=S3,location=your-artifacts-bucket-name \
  --pipeline "$(cat pipeline-definition.json)"
```

## Pipeline Components

### 1. Source Stage
- Retrieves code from GitHub repository when changes are pushed
- Uses CodeStar Connection for GitHub integration

### 2. Build Stage
- Uses CodeBuild to build the application
- Runs tests and packages the application
- Configuration in `buildspec.yml`

### 3. Deploy Stage
- Uses CodeDeploy to deploy the application to EC2 instances
- Follows deployment instructions in `appspec.yml`
- Uses deployment scripts in the `scripts/` directory

## Troubleshooting

- Check CloudWatch Logs for CodeBuild and CodeDeploy logs
- Verify IAM roles have the necessary permissions
- Ensure the Auto Scaling Group exists and has running instances
- Validate that the CodeStar Connection is properly configured