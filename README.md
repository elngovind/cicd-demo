# CI/CD Pipeline Demo

This repository contains a simple web application and CloudFormation templates to set up a complete CI/CD pipeline using AWS services.

## Architecture

The CI/CD pipeline uses the following AWS services:
- AWS CodePipeline - Orchestrates the pipeline workflow
- AWS CodeBuild - Builds and tests the application
- AWS CodeDeploy - Deploys the application to EC2 instances
- Amazon S3 - Stores artifacts and templates
- AWS IAM - Manages permissions and roles
- AWS Systems Manager - Manages CodeDeploy agent installation

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

## CodeDeploy Agent Installation

The CodeDeploy agent must be installed on all EC2 instances in your Auto Scaling Group. We recommend using AWS Systems Manager Distributor for this purpose:

1. Ensure your instances have the SSM Agent installed (included by default in Amazon Linux 2)
2. Attach an IAM role with the `AmazonSSMManagedInstanceCore` policy to your instances
3. Install the CodeDeploy agent using one of these methods:

### Option A: One-time installation via AWS Console
1. Go to AWS Console > Systems Manager > Distributor
2. Select "AWSCodeDeployAgent" from the list of packages
3. Click "Install one time"
4. Select your instances or target by tags
5. Click "Install"

### Option B: Automated installation via AWS CLI
```bash
# Install on specific instances
aws ssm send-command \
  --document-name "AWS-ConfigureAWSPackage" \
  --parameters "action=Install,name=AWSCodeDeployAgent" \
  --targets "Key=instanceids,Values=i-1234567890abcdef0,i-0598c7d356eba48d7"

# Install on instances with specific tags
aws ssm send-command \
  --document-name "AWS-ConfigureAWSPackage" \
  --parameters "action=Install,name=AWSCodeDeployAgent" \
  --targets "Key=tag:Name,Values=MyWebServer"
```

### Option C: Automated installation via State Manager Association
```bash
aws ssm create-association \
  --name "AWS-ConfigureAWSPackage" \
  --parameters "action=Install,name=AWSCodeDeployAgent" \
  --targets "Key=tag:Name,Values=MyWebServer" \
  --schedule-expression "cron(0 2 ? * SUN *)"
```

This creates an association that will install and maintain the CodeDeploy agent on all instances with the tag "Name=MyWebServer", running weekly on Sundays at 2:00 AM.

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

##### Step 3: Create CodeStar Connection
1. Go to AWS Console > Developer Tools > Settings > Connections
2. Click "Create connection"
3. Select "GitHub" as the provider
4. Enter a connection name (e.g., "GitHub-Connection")
5. Click "Connect to GitHub"
6. In the new browser window, sign in to GitHub if prompted
7. Choose whether to grant access to all repositories or select specific repositories
   - If selecting specific repositories, make sure to include `cicd-demo`
8. Click "Authorize AWS Connector for GitHub"
9. You'll be redirected back to AWS Console
10. Wait for the connection status to show "Available"
11. Click "Complete connection"
12. Copy the connection ARN for use in the next step

For more detailed instructions, see [CODESTAR_CONNECTION.md](CODESTAR_CONNECTION.md)

##### Step 4: Deploy the Master Stack
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

##### Step 5: Install CodeDeploy Agent
Follow the CodeDeploy Agent Installation instructions above to install the agent on your EC2 instances.

##### Step 6: Monitor Deployment
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

##### Step 3: Create CodeStar Connection (if not already created)
```bash
# Create the connection (status will be PENDING)
aws codestar-connections create-connection \
  --provider-type GitHub \
  --connection-name GitHub-Connection
```

Then complete the connection:
1. Go to AWS Console > Developer Tools > Settings > Connections
2. Find your connection with status "Pending"
3. Click on it and select "Update pending connection"
4. Follow the GitHub authorization steps
5. Get the connection ARN:
```bash
aws codestar-connections list-connections \
  --provider-type GitHub \
  --query "Connections[?ConnectionName=='GitHub-Connection'].ConnectionArn" \
  --output text
```

For more detailed instructions, see [CODESTAR_CONNECTION.md](CODESTAR_CONNECTION.md)

##### Step 4: Deploy the Master Stack
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

##### Step 5: Install CodeDeploy Agent
Install the CodeDeploy agent on your EC2 instances using Systems Manager as described in the CodeDeploy Agent Installation section.

##### Step 6: Monitor Deployment
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

#### Step 5: Install CodeDeploy Agent
Install the CodeDeploy agent on your EC2 instances using Systems Manager as described in the CodeDeploy Agent Installation section.

#### Step 6: Create CodePipeline
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
- Verify the CodeDeploy agent is installed and running on your instances:
  ```bash
  aws ssm send-command \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=['service codedeploy-agent status']" \
    --targets "Key=instanceids,Values=i-1234567890abcdef0"
  ```