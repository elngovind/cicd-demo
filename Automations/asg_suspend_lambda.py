import boto3
import os
import json
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
autoscaling = boto3.client('autoscaling')

def lambda_handler(event, context):
    """
    Lambda function to suspend/resume Auto Scaling processes during deployments
    
    Event format:
    {
        "action": "suspend|resume",
        "asg_name": "your-auto-scaling-group-name",
        "processes": ["Launch", "Terminate", "HealthCheck", "ReplaceUnhealthy", "AZRebalance", "AlarmNotification", "ScheduledActions", "AddToLoadBalancer"]
    }
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    # Get parameters from event or environment variables
    action = event.get('action', os.environ.get('DEFAULT_ACTION', 'suspend'))
    asg_name = event.get('asg_name', os.environ.get('ASG_NAME'))
    processes = event.get('processes', os.environ.get('PROCESSES', 'Launch,Terminate,HealthCheck,ReplaceUnhealthy,AZRebalance').split(','))
    
    if not asg_name:
        error_msg = "No Auto Scaling Group name provided"
        logger.error(error_msg)
        return {
            'statusCode': 400,
            'body': error_msg
        }
    
    try:
        if action.lower() == 'suspend':
            logger.info(f"Suspending processes {processes} for ASG {asg_name}")
            response = autoscaling.suspend_processes(
                AutoScalingGroupName=asg_name,
                ScalingProcesses=processes
            )
            message = f"Successfully suspended processes {processes} for ASG {asg_name}"
        elif action.lower() == 'resume':
            logger.info(f"Resuming processes {processes} for ASG {asg_name}")
            response = autoscaling.resume_processes(
                AutoScalingGroupName=asg_name,
                ScalingProcesses=processes
            )
            message = f"Successfully resumed processes {processes} for ASG {asg_name}"
        else:
            error_msg = f"Invalid action: {action}. Must be 'suspend' or 'resume'"
            logger.error(error_msg)
            return {
                'statusCode': 400,
                'body': error_msg
            }
        
        logger.info(message)
        return {
            'statusCode': 200,
            'body': message
        }
    
    except Exception as e:
        error_msg = f"Error performing {action} on ASG {asg_name}: {str(e)}"
        logger.error(error_msg)
        return {
            'statusCode': 500,
            'body': error_msg
        }