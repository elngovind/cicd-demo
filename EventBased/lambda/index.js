// Lambda function to process API Gateway events and publish to SNS
exports.handler = async (event) => {
    const AWS = require('aws-sdk');
    const sns = new AWS.SNS();
    
    try {
        // Parse the incoming event
        const body = JSON.parse(event.body);
        const eventType = body.eventType;
        const eventData = body.data;
        
        // Add metadata
        eventData.processedAt = new Date().toISOString();
        eventData.source = "api-gateway";
        
        // Publish to SNS topic
        const params = {
            TopicArn: process.env.SNS_TOPIC_ARN,
            Message: JSON.stringify(eventData),
            MessageAttributes: {
                'eventType': {
                    DataType: 'String',
                    StringValue: eventType
                }
            }
        };
        
        await sns.publish(params).promise();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Event published successfully",
                eventId: eventData.orderId || eventData.paymentId || eventData.shipmentId
            })
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to process event",
                error: error.message
            })
        };
    }
};