# AWS Console Deployment Instructions

## Step 1: Create S3 Buckets
1. Open AWS Console → S3
2. Create three buckets:
   - Source bucket: `image-resize-source`
   - Resized bucket: `image-resize-destination`
   - Website bucket: `image-resize-website`
3. For website bucket:
   - Enable static website hosting
   - Set index document to `index.html`
   - Set error document to `error.html`
   - Add bucket policy for public read access

## Step 2: Create Lambda Function
1. Open AWS Console → Lambda
2. Create function:
   - Name: `ImageResizeFunction`
   - Runtime: Python 3.9
   - Create new role with basic Lambda permissions
3. Upload code:
   - Zip `lambda_function.py` and dependencies
   - Or copy-paste code from `lambda_function.py`
4. Add environment variables:
   - `DESTINATION_BUCKET`: Your resized bucket name
   - `RESIZE_WIDTH`: 800
   - `RESIZE_HEIGHT`: 600
5. Add permissions:
   - Add S3 read permission for source bucket
   - Add S3 write permission for destination bucket

## Step 3: Configure S3 Event Trigger
1. Go to source bucket → Properties
2. Add event notification:
   - Event type: All object create events
   - Destination: Lambda function
   - Function: `ImageResizeFunction`
   - Filter: `.jpg`, `.jpeg`, `.png`

## Step 4: Deploy Website
1. Update `website/script.js`:
   - Set `region` to your AWS region
   - Set `sourceBucketName` to your source bucket
   - Set `resizedBucketName` to your resized bucket
2. Upload all files from `website/` to website bucket

## Step 5: Set Up Authentication
1. Go to AWS Console → Cognito
2. Create identity pool:
   - Enable access to unauthenticated identities
   - Create new IAM roles
3. Update IAM role for unauthenticated users:
   - Add S3 permissions for source and resized buckets
4. Update `script.js` with your Identity Pool ID
5. Re-upload `script.js` to website bucket

## Step 6: Test the Solution
1. Access website URL: `http://image-resize-website.s3-website-[REGION].amazonaws.com`
2. Upload an image
3. Verify resized image appears in destination bucket