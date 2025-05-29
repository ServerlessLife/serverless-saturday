import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandInput,
} from "@aws-sdk/client-eventbridge";
import { generateSampleOrder } from "../utils/generateSampleOrder";

const eventBridge = new EventBridgeClient({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const order = generateSampleOrder();

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

  await eventBridge.send(new PutEventsCommand(params));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Order submitted successfully" }),
  };
};
