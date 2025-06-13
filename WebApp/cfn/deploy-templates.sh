#!/bin/bash

# Script to deploy CloudFormation templates to S3 bucket
# Usage: ./deploy-templates.sh <bucket-name>

if [ $# -ne 1 ]; then
  echo "Usage: $0 <bucket-name>"
  exit 1
fi

BUCKET_NAME=$1
REGION=$(aws configure get region)
if [ -z "$REGION" ]; then
  REGION="us-east-1"  # Default region if not configured
fi

echo "Deploying CloudFormation templates to s3://$BUCKET_NAME"

# Create the bucket if it doesn't exist
aws s3api head-bucket --bucket $BUCKET_NAME 2>/dev/null
if [ $? -ne 0 ]; then
  echo "Creating bucket $BUCKET_NAME in region $REGION..."
  aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION $([ "$REGION" != "us-east-1" ] && echo "--create-bucket-configuration LocationConstraint=$REGION")
  
  # Enable versioning on the bucket
  aws s3api put-bucket-versioning --bucket $BUCKET_NAME --versioning-configuration Status=Enabled
  
  # Block public access
  aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
fi

# Upload all YAML templates
for template in *.yaml; do
  echo "Uploading $template to s3://$BUCKET_NAME/$template"
  aws s3 cp $template s3://$BUCKET_NAME/$template
done

echo "Templates deployed successfully!"
echo ""
echo "To deploy the master stack, run:"
echo "aws cloudformation create-stack --stack-name cicd-pipeline --template-url https://s3.amazonaws.com/$BUCKET_NAME/master.yaml --parameters ParameterKey=S3TemplateURL,ParameterValue=https://s3.amazonaws.com/$BUCKET_NAME ParameterKey=AutoScalingGroupName,ParameterValue=<your-asg-name> ParameterKey=CodeStarConnectionArn,ParameterValue=<your-codestar-connection-arn> --capabilities CAPABILITY_IAM"