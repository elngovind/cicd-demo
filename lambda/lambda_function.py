import boto3
import os
import json
from io import BytesIO
from PIL import Image

s3_client = boto3.client('s3')

# Environment variables
destination_bucket = os.environ['DESTINATION_BUCKET']
resize_width = int(os.environ.get('RESIZE_WIDTH', 800))
resize_height = int(os.environ.get('RESIZE_HEIGHT', 600))

def handler(event, context):
    # Get the object from the event
    source_bucket = event['Records'][0]['s3']['bucket']['name']
    source_key = event['Records'][0]['s3']['object']['key'].replace('+', ' ')
    
    # Infer the image type from the file suffix
    if source_key.lower().endswith(('.jpg', '.jpeg')):
        image_type = 'jpeg'
    elif source_key.lower().endswith('.png'):
        image_type = 'png'
    else:
        print(f"Unsupported image type: {source_key}")
        return
    
    try:
        # Download the image from the S3 source bucket
        response = s3_client.get_object(Bucket=source_bucket, Key=source_key)
        image_content = response['Body'].read()
        
        # Use PIL to resize the image
        with Image.open(BytesIO(image_content)) as image:
            # Resize the image while maintaining aspect ratio
            image.thumbnail((resize_width, resize_height))
            
            # Save the resized image to a buffer
            buffer = BytesIO()
            image.save(buffer, format=image_type.upper())
            buffer.seek(0)
            
            # Upload the resized image to the destination bucket
            dest_key = f"resized-{source_key}"
            s3_client.put_object(
                Bucket=destination_bucket,
                Key=dest_key,
                Body=buffer,
                ContentType=f"image/{image_type}"
            )
            
            print(f"Successfully resized {source_bucket}/{source_key} and uploaded to {destination_bucket}/{dest_key}")
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Image resized successfully',
                    'source': f"{source_bucket}/{source_key}",
                    'destination': f"{destination_bucket}/{dest_key}"
                })
            }
    except Exception as e:
        print(f"Error processing {source_bucket}/{source_key}: {str(e)}")
        raise