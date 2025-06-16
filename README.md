# S3 Event-Based Image Resizing with AWS Lambda

This solution demonstrates how to use AWS Lambda to automatically resize images uploaded to an S3 bucket, with a web UI for uploading images.

## Architecture

1. User uploads an image through the web UI
2. Image is stored in the source S3 bucket
3. S3 event notification triggers the Lambda function
4. Lambda function downloads the image, resizes it using the Pillow library
5. Lambda uploads the resized image to the destination S3 bucket
6. Web UI displays both the original and resized images

## Components

- **CloudFormation Template**: Defines the AWS resources (S3 buckets, Lambda function)
- **Python Lambda Function**: Resizes images using the Pillow library
- **Web UI**: Allows users to upload images and view the results
- **Deployment Script**: Automates the deployment process

## Deployment Instructions

### Prerequisites
- AWS CLI installed and configured
- Python 3.9 or later
- Access to create AWS resources (S3, Lambda, IAM roles)

### Deploy the Solution

1. Install Lambda dependencies:
   ```
   cd lambda
   pip install -r requirements.txt -t .
   cd ..
   ```

2. Deploy using the provided script:
   ```
   ./deploy.sh
   ```

3. After deployment, access the web UI using the URL provided in the output.

## Authentication

For production use, update the web UI to use Amazon Cognito for authentication:

1. Create an Amazon Cognito Identity Pool
2. Update the `IdentityPoolId` in the `website/script.js` file
3. Re-upload the script.js file to the website bucket