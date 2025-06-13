# Setting Up AWS CodeStar Connection to GitHub

This guide provides step-by-step instructions for creating an AWS CodeStar connection to GitHub, which is required for the CI/CD pipeline to access your GitHub repository.

## Console Method

1. **Navigate to CodeStar Connections**
   - Sign in to the AWS Management Console
   - Go to Developer Tools > Settings > Connections
   - Or use this direct link: https://console.aws.amazon.com/codesuite/settings/connections

2. **Create a New Connection**
   - Click "Create connection"
   - Select "GitHub" as the provider
   - Enter a connection name (e.g., "GitHub-Connection")
   - Click "Connect to GitHub"

3. **Authorize AWS Connector**
   - A new browser window will open to GitHub
   - If prompted, sign in to your GitHub account
   - Review the permissions requested by AWS Connector for GitHub
   - Choose whether to grant access to all repositories or select specific repositories
   - Click "Authorize AWS Connector for GitHub"

4. **Complete the Connection**
   - You'll be redirected back to the AWS Console
   - The connection status should show "Available" (this may take a few seconds)
   - Click "Complete connection"

5. **Get the Connection ARN**
   - Once the connection is created, you'll see it in the connections list
   - Copy the ARN (it will look like `arn:aws:codestar-connections:region:account-id:connection/connection-id`)
   - You'll need this ARN when deploying the CloudFormation template

## CLI Method

You can create a connection using the AWS CLI:

```bash
# Create the connection
aws codestar-connections create-connection \
  --provider-type GitHub \
  --connection-name GitHub-Connection

# This will output a connection ARN and status "PENDING"
```

After running this command:

1. Go to the AWS Console > Developer Tools > Settings > Connections
2. Find your new connection (status will be "Pending")
3. Click on the connection
4. Click "Update pending connection"
5. Follow the GitHub authorization steps as described in the Console Method
6. Once completed, get the connection ARN:

```bash
aws codestar-connections list-connections \
  --provider-type GitHub \
  --query "Connections[?ConnectionName=='GitHub-Connection'].ConnectionArn" \
  --output text
```

## Important Notes

- The connection requires you to have admin access to the GitHub repository or organization
- Connections can be scoped to specific repositories or all repositories in your GitHub account
- If you select specific repositories, make sure to include the repository used in this CI/CD pipeline
- The connection ARN is required for the CloudFormation template parameter `CodeStarConnectionArn`
- Connections may need to be periodically reauthorized if GitHub access tokens expire