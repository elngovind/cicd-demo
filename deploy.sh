#!/bin/bash

# Exit on error
set -e

# Variables
STACK_NAME="image-resize-solution"
REGION=$(aws configure get region)
if [ -z "$REGION" ]; then
    REGION="us-east-1"  # Default region
fi

echo "Deploying to region: $REGION"

# Install Lambda dependencies
echo "Installing Lambda dependencies..."
cd lambda
pip install -r requirements.txt -t .
cd ..

# Deploy CloudFormation stack
echo "Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --region $REGION

# Get outputs from the stack
echo "Getting stack outputs..."
OUTPUTS=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs" \
  --region $REGION)

# Extract bucket names and website URL
SOURCE_BUCKET=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="SourceBucketName") | .OutputValue')
RESIZED_BUCKET=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ResizedBucketName") | .OutputValue')
WEBSITE_BUCKET=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="WebsiteURL") | .OutputValue' | sed 's/http:\/\///' | sed 's/\.s3-website-.*//')
WEBSITE_URL=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="WebsiteURL") | .OutputValue')

echo "Source Bucket: $SOURCE_BUCKET"
echo "Resized Bucket: $RESIZED_BUCKET"
echo "Website Bucket: $WEBSITE_BUCKET"
echo "Website URL: $WEBSITE_URL"

# Update the script.js file with the correct values
echo "Updating script.js with bucket information..."
sed -i '' "s/YOUR_AWS_REGION/$REGION/g" website/script.js
sed -i '' "s/YOUR_SOURCE_BUCKET_NAME/$SOURCE_BUCKET/g" website/script.js
sed -i '' "s/YOUR_RESIZED_BUCKET_NAME/$RESIZED_BUCKET/g" website/script.js

echo "NOTE: You need to create a Cognito Identity Pool and update the IdentityPoolId in script.js"
echo "For testing purposes, you can use AWS IAM credentials directly (not recommended for production)"

# Upload website files to S3
echo "Uploading website files to S3..."
aws s3 sync website/ s3://$WEBSITE_BUCKET/ --region $REGION

echo "Deployment complete!"
echo "Website URL: $WEBSITE_URL"
echo ""
echo "IMPORTANT: Before using the website, you need to set up authentication."
echo "See the README.md file for instructions on setting up Amazon Cognito."