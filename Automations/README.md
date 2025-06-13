# Auto Scaling Group Suspension for Deployments

This automation suspends Auto Scaling processes during deployments to prevent scaling activities from interfering with the deployment process.

## Components

1. **Lambda Function** (`asg_suspend_lambda.py`): Python function that suspends or resumes Auto Scaling processes
2. **CloudFormation Template** (`asg_suspend_template.yaml`): Creates all necessary resources including:
   - Lambda function
   - IAM role with required permissions
   - EventBridge rules to trigger the function before and after deployments
   - Permissions for EventBridge to invoke the Lambda function

## Deployment Instructions

### Option 1: Using AWS CLI

```bash
aws cloudformation create-stack \
  --stack-name asg-suspend-automation \
  --template-body file://Automations/asg_suspend_template.yaml \
  --parameters ParameterKey=AutoScalingGroupName,ParameterValue=your-asg-name \
  --capabilities CAPABILITY_IAM
```

### Option 2: Using AWS Console

1. Go to AWS Console > CloudFormation > Create stack > With new resources
2. Upload the `asg_suspend_template.yaml` file
3. Enter a stack name (e.g., `asg-suspend-automation`)
4. Specify parameters:
   - **AutoScalingGroupName**: Name of your Auto Scaling Group
   - **DefaultAction**: Default action to perform (suspend or resume)
   - **ProcessesToSuspend**: Comma-separated list of processes to suspend
5. Click Next, configure any additional options, and create the stack

## How It Works

1. When a CodeDeploy deployment starts, the EventBridge rule triggers the Lambda function with the "suspend" action
2. The Lambda function suspends the specified Auto Scaling processes for the target Auto Scaling Group
3. After the deployment completes (success or failure), another EventBridge rule triggers the Lambda function with the "resume" action
4. The Lambda function resumes the previously suspended Auto Scaling processes

## Manual Invocation

You can manually invoke the Lambda function using the AWS CLI:

```bash
aws lambda invoke \
  --function-name ASGSuspendFunction-asg-suspend-automation \
  --payload '{"action": "suspend", "asg_name": "your-asg-name"}' \
  response.json
```

To resume processes:

```bash
aws lambda invoke \
  --function-name ASGSuspendFunction-asg-suspend-automation \
  --payload '{"action": "resume", "asg_name": "your-asg-name"}' \
  response.json
```