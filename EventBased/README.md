# AWS Event-Based Architecture Demo

This project demonstrates an event-driven architecture using AWS services like Lambda, SNS, SQS, DynamoDB, and EventBridge.

## Features

- Interactive demo of event publishing and processing
- Visual representation of event flow through AWS services
- Sample code for Lambda functions and CloudFormation templates
- Responsive design for all devices

## Getting Started

1. Clone this repository
2. Open `index.html` in your browser
3. Try the interactive demo by publishing events

## Architecture

The architecture uses the following AWS services:

- **API Gateway**: Receives HTTP requests and triggers Lambda functions
- **Lambda**: Serverless functions that process events and publish to SNS
- **SNS**: Pub/sub messaging service that fans out events to multiple subscribers
- **SQS**: Message queuing service that buffers events for processing
- **DynamoDB**: NoSQL database for storing event data with streams capability
- **EventBridge**: Event bus that routes events between AWS services and applications

## Implementation

The demo includes:

- Frontend UI for event publishing
- Visual event flow diagram
- Sample Lambda code
- CloudFormation template

## License

MIT