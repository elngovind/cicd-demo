# S3 Event-Based Image Resizing with AWS Lambda

This solution demonstrates how to use AWS Lambda to automatically resize images uploaded to an S3 bucket, with a web UI for uploading images.

## Architecture

1. User uploads an image through the web UI
2. Image is stored in the source S3 bucket
3. S3 event notification triggers the Lambda function
4. Lambda function downloads the image, resizes it using the Sharp library
5. Lambda uploads the resized image to the destination S3 bucket
6. Web UI displays both the original and resized images

## Deployment Instructions

### Prerequisites
- AWS CLI installed and configured
- Node.js and npm installed (for local development)
- AWS SAM CLI (optional, for local testing)

### Deploy the Solution

1. Install the Lambda function dependencies:
   ```
   cd lambda
   npm install
   cd ..
   ```

2. Deploy the CloudFormation stack:
   ```
   aws cloudformation deploy \
     --template-file template.yaml \
     --stack-name image-resize-solution \
     --capabilities CAPABILITY_IAM
   ```

3. Get the S3 bucket names and website URL:
   ```
   aws cloudformation describe-stacks \
     --stack-name image-resize-solution \
     --query "Stacks[0].Outputs"
   ```

4. Update the web UI configuration:
   - Edit `website/script.js` and update:
     - `region` with your AWS region
     - `sourceBucketName` with the source bucket name
     - `resizedBucketName` with the resized bucket name
   - For authentication, create a Cognito Identity Pool and update the `IdentityPoolId`

5. Upload the website files to the website S3 bucket:
   ```
   aws s3 sync website/ s3://YOUR_WEBSITE_BUCKET_NAME/
   ```

6. Access the website using the URL from step 3.

### Setting up Authentication

For a production environment, you should set up proper authentication:

1. Create an Amazon Cognito Identity Pool with unauthenticated access
2. Configure the Identity Pool to have limited permissions to the S3 buckets
3. Update the `IdentityPoolId` in the script.js file

## Customization

You can modify the resize dimensions by updating the environment variables in the CloudFormation template:
- `RESIZE_WIDTH`: Width of the resized image (default: 800)
- `RESIZE_HEIGHT`: Height of the resized image (default: 600)