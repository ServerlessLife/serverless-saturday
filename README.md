# 🚀 Serverless Saturdays Demo

## 📅 Event Information

**AWS User Group Tirupati Meetup**

- 🔗 [Meetup Event](https://www.meetup.com/aws-user-group-tirupati/events/307954373/?utm_medium=referral&utm_campaign=share-btn_savedevents_share_modal&utm_source=link)
- 📺 [YouTube Live Stream](https://www.youtube.com/live/W4cHTCT-gZs)

## 🏗️ Architecture Overview

This project demonstrates a serverless order processing system built with AWS CDK and TypeScript, featuring:

### 🛠️ Services Used

- **API Gateway** - HTTP API for order submission
- **AWS Lambda** - Serverless compute for order processing
- **EventBridge** - Event-driven messaging
- **SQS** - Message queuing with Dead Letter Queue
- **X-Ray** - Distributed tracing
- **CloudWatch** - Logging and monitoring

### 📊 Data Flow

```
API Gateway → sendOrders Lambda → EventBridge → SQS → processOrders Lambda
                                                ↓
                                           Dead Letter Queue
```

## 🚦 Getting Started

### Installation

```bash
npm install
```

### Deployment

```bash
npm run deploy
```

## 🔧 Project Structure

```
├── lib/                     # CDK Infrastructure
├── services/
│   ├── lambda/             # Lambda functions
│   └── types/              # Shared TypeScript types
├── utils/                  # Utility functions and helpers
├── bin/                    # CDK app entry point
└── README.md
```

## 🎯 Learning Objectives

1. **Debugging Serverless Applications**

   - CloudWatch Logs analysis
   - X-Ray trace investigation
   - Error propagation patterns

2. **Best Practices**

   - Structured logging
   - Error handling strategies
   - Observability patterns
