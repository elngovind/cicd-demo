# AWS Console Deployment Instructions

## Step 1: Create S3 Buckets
1. Open AWS Console → S3
2. Create three buckets:
   - Source bucket: `image-resize-source`
   - Resized bucket: `image-resize-destination`
   - Website bucket: `image-resize-website`
3. For website bucket:
   - Enable static website hosting:
     1. Go to the bucket → Properties → Static website hosting
     2. Select "Enable"
     3. Set index document to `index.html`
     4. Set error document to `error.html`
   - Disable Block Public Access:
     1. Go to the bucket → Permissions
     2. Find "Block public access (bucket settings)"
     3. Click "Edit"
     4. Uncheck "Block all public access"
     5. Save changes (confirm by typing "confirm")
   - Add bucket policy for public read access:
     1. Go to the bucket → Permissions → Bucket policy
     2. Add this policy (replace `YOUR-WEBSITE-BUCKET-NAME`):
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Sid": "PublicReadGetObject",
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::YOUR-WEBSITE-BUCKET-NAME/*"
         }
       ]
     }
     ```
4. For source and resized buckets:
   - Add CORS configuration:
     1. Go to each bucket → Permissions → CORS
     2. Add this configuration:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
         "AllowedOrigins": ["*"],
         "ExposeHeaders": [],
         "MaxAgeSeconds": 3000
       }
     ]
     ```

## Step 2: Create Lambda Function
1. Open AWS Console → Lambda
2. Create function:
   - Name: `ImageResizeFunction`
   - Runtime: Python 3.9
   - Create new role with basic Lambda permissions
3. Upload code:
   - Option 1: Upload the pre-packaged ZIP file from the `deployment` folder
   - Option 2: Create a ZIP file with `lambda_function.py` and install dependencies:
     ```
     pip install pillow boto3 -t .
     zip -r lambda_function.zip .
     ```
4. Add environment variables:
   - `DESTINATION_BUCKET`: Your resized bucket name
   - `RESIZE_WIDTH`: 800
   - `RESIZE_HEIGHT`: 600
5. Add permissions:
   - Go to Configuration → Permissions → Execution role
   - Click on the role name to go to IAM
   - Add inline policy:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": ["s3:GetObject"],
           "Resource": "arn:aws:s3:::YOUR-SOURCE-BUCKET-NAME/*"
         },
         {
           "Effect": "Allow",
           "Action": ["s3:PutObject"],
           "Resource": "arn:aws:s3:::YOUR-RESIZED-BUCKET-NAME/*"
         }
       ]
     }
     ```

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

### Understanding Amazon Cognito for Authentication
Amazon Cognito provides authentication, authorization, and user management for web and mobile apps. For our image resizing application, we'll use Cognito Identity Pools to allow users to upload images to S3 without requiring them to sign in (unauthenticated access).

### Create a Cognito Identity Pool
1. Open AWS Console → Cognito
2. Click "Identity Pools" in the left navigation (or "Federated Identities" in some regions)
3. Click "Create new identity pool"
4. Configure the identity pool:
   - Identity pool name: `ImageResizerIdentityPool`
   - Expand "Unauthenticated identities"
   - Check "Enable access to unauthenticated identities"
   - Click "Create Pool"
5. Configure IAM roles:
   - For the "Unauthenticated role", you can use the default name or customize it
   - Click "Allow" to create the roles

### Configure IAM Permissions
1. Open AWS Console → IAM
2. Click "Roles" in the left navigation
3. Find and click on the unauthenticated role created in the previous step (it will have "unauth" in the name)
4. Click "Add permissions" → "Create inline policy"
5. Switch to the JSON editor and paste the following policy (replace with your actual bucket names):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject"
         ],
         "Resource": [
           "arn:aws:s3:::YOUR-SOURCE-BUCKET-NAME/*",
           "arn:aws:s3:::YOUR-RESIZED-BUCKET-NAME/*"
         ]
       }
     ]
   }
   ```
6. Click "Review policy"
7. Name the policy `S3ImageResizerAccess`
8. Click "Create policy"

### Update the Website Code
1. Open the `website/script.js` file in a text editor
2. Find the AWS configuration section (around line 15-20)
3. Update the following values:
   - `region`: Your AWS region (e.g., 'us-east-1')
   - `sourceBucketName`: Your source bucket name
   - `resizedBucketName`: Your resized bucket name
   - `IdentityPoolId`: Your Cognito Identity Pool ID (found in the Cognito console)

   Example:
   ```javascript
   // AWS Configuration
   const region = 'us-east-1';
   const sourceBucketName = 'image-resize-source';
   const resizedBucketName = 'image-resize-destination';
   
   // Initialize AWS SDK
   AWS.config.region = region;
   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
       IdentityPoolId: 'us-east-1:a1b2c3d4-5678-90ab-cdef-EXAMPLE11111',
   });
   ```
4. Save the file and upload it to your website bucket

### Testing Authentication
1. Open your website URL in a browser
2. Open browser developer tools (F12 or right-click → Inspect)
3. Go to the Network tab
4. Try to upload an image
5. Look for requests to Cognito and S3 services
6. If you see 403 errors, check your IAM permissions and Cognito setup

## Step 6: Test the Solution
1. Access website URL: `http://image-resize-website.s3-website-[REGION].amazonaws.com`
2. Upload an image
3. Verify resized image appears in destination bucket