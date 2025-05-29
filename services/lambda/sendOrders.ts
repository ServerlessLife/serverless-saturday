import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";
import AWSXRay from "aws-xray-sdk-core";
import { generateSampleOrder } from "./generateSampleOrder";

const eventBridge = AWSXRay.captureAWSv3Client(new EventBridgeClient({}));

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const segment = AWSXRay.getSegment();
  const subsegment = segment?.addNewSubsegment("sendOrders-my-subsegment");

  try {
    const order = generateSampleOrder();

    subsegment?.addAnnotation("orderId", order.orderId);
    subsegment?.addMetadata("orderDetails", order);

    const params: PutEventsCommandInput = {
      Entries: [
        {
          Source: "orders.service",
          DetailType: "order",
          Detail: JSON.stringify(order),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    };

    console.log(
      JSON.stringify({
        message: "Sending order to EventBridge",
        ...order,
      })
    );
    await eventBridge.send(new PutEventsCommand(params));

    subsegment?.close();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Order submitted successfully" }),
    };
  } catch (error) {
    subsegment?.addError(error as Error);
    subsegment?.close();
    throw error;
  }
};
