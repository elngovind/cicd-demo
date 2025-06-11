# Deploying from AWS Console

This guide provides step-by-step instructions for deploying the CI/CD pipeline using the AWS Management Console.

## Step 1: Store GitHub Token in AWS Secrets Manager

1. Go to AWS Secrets Manager console
2. Click "Store a new secret"
3. Select "Other type of secret"
4. Add key-value pair: Key = `token`, Value = your GitHub token
5. Click "Next"
6. Secret name: `GitHubToken`
7. Click "Next", then "Next" again, and "Store"

## Step 2: Deploy the Master CloudFormation Template

1. Go to AWS CloudFormation console
2. Click "Create stack" > "With new resources"
3. Select "Upload a template file"
4. Click "Choose file" and upload the master.yaml file (or use Amazon S3 URL)
5. Click "Next"
6. Enter stack name: `webapp-cicd`
7. Enter parameters:
   - ProjectName: `webapp`
   - RepositoryName: `cicd-demo`
   - RepositoryOwner: `elngovind`
   - BranchName: `main`
   - AutoScalingGroupName: [your Auto Scaling Group name]
8. Click "Next"
9. On the Configure stack options page, click "Next"
10. Check the box acknowledging IAM resource creation
11. Click "Create stack"

## Step 3: Monitor Stack Creation

1. Wait for the stack status to change to "CREATE_COMPLETE"
2. You can view the progress in the "Events" tab
3. Once complete, go to the "Outputs" tab to see the created resources

## Step 4: Verify the Pipeline

1. Go to AWS CodePipeline console
2. Click on the pipeline named `webapp-pipeline`
3. The pipeline should start automatically
4. Monitor the pipeline execution through all stages

## Step 5: Access Your Application

1. After successful deployment, access your application via the EC2 instance's public IP or DNS
2. The application will be running on port 80 (HTTP)

## Troubleshooting

If you encounter issues during deployment:

1. Check CloudFormation events for error messages
2. Verify that the GitHub token has the correct permissions
3. Ensure the Auto Scaling Group exists and is properly configured
4. Check that the EC2 instances have the necessary IAM roles for CodeDeploy