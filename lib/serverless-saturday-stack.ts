import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda_nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2_integration from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";

export class ServerlessSaturdayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // --------------- DEMO LAMBDA LIVE DEBUGER ---------------
    const helloFunction = new lambda_nodejs.NodejsFunction(
      this,
      "HelloLambda",
      {
        entry: "services/lambda/hello.ts",
        runtime: lambda.Runtime.NODEJS_22_X,
      }
    );

    const api = new apigwv2.HttpApi(this, "ServerlessSaturdayApi", {
      description: "API for Serverless Saturday",
    });

    api.addRoutes({
      path: "/",
      methods: [apigwv2.HttpMethod.ANY],
      integration: new apigwv2_integration.HttpLambdaIntegration(
        "HelloLambdaIntegration",
        helloFunction
      ),
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url!,
    });

    // ---------------- DEMO DEBUGGING TIPS ----------------

    // Create custom EventBridge bus
    const orderEventBus = new events.EventBus(this, "OrderEventBus", {
      eventBusName: "orders-event-bus",
    });

    // Create Dead Letter Queue for failed order processing
    const orderDlq = new sqs.Queue(this, "OrderDlq", {
      queueName: "order-processing-dlq",
      retentionPeriod: cdk.Duration.days(14),
    });

    // Create SQS queue for order processing
    const orderQueue = new sqs.Queue(this, "OrderQueue", {
      queueName: "order-processing-queue",
      visibilityTimeout: cdk.Duration.seconds(300),
      deadLetterQueue: {
        queue: orderDlq,
        maxReceiveCount: 1,
      },
    });

    // Create sendOrders Lambda function
    const sendOrdersFunction = new lambda_nodejs.NodejsFunction(
      this,
      "SendOrdersFunction",
      {
        entry: "services/lambda/sendOrders.ts",
        runtime: lambda.Runtime.NODEJS_22_X,
        environment: {
          EVENT_BUS_NAME: orderEventBus.eventBusName,
        },
        tracing: lambda.Tracing.ACTIVE,
      }
    );

    // Grant permissions to publish to EventBridge
    orderEventBus.grantPutEventsTo(sendOrdersFunction);

    // Create processOrders Lambda function
    const processOrdersFunction = new lambda_nodejs.NodejsFunction(
      this,
      "ProcessOrdersFunction",
      {
        entry: "services/lambda/processOrders.ts",
        runtime: lambda.Runtime.NODEJS_22_X,
        tracing: lambda.Tracing.ACTIVE,
      }
    );

    processOrdersFunction.addEventSource(
      new lambdaEventSources.SqsEventSource(orderQueue, {
        reportBatchItemFailures: true,
      })
    );

    new events.Rule(this, "OrderRule", {
      eventBus: orderEventBus,
      eventPattern: {
        source: ["orders.service"],
        detailType: ["order"],
      },
      targets: [new targets.SqsQueue(orderQueue)],
    });

    // Add GET /orders endpoint for sendOrders function
    api.addRoutes({
      path: "/order",
      methods: [apigwv2.HttpMethod.GET],
      integration: new apigwv2_integration.HttpLambdaIntegration(
        "SendOrdersLambdaIntegration",
        sendOrdersFunction
      ),
    });
  }
}
