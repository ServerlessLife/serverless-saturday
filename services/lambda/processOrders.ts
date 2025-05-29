import { EventBridgeEvent, SQSEvent, SQSBatchResponse } from "aws-lambda";
import { OrderItem, Order } from "../types/orders";

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: string[] = [];

  for (const record of event.Records) {
    const messageBody: EventBridgeEvent<"order", Order> = JSON.parse(
      record.body
    );
    const order = messageBody.detail;

    try {
      await processOrder(order);
    } catch (error) {
      console.error(error);

      batchItemFailures.push(record.messageId);
    }
  }

  return {
    batchItemFailures: batchItemFailures.map((id) => ({ itemIdentifier: id })),
  };
};

async function processOrder(order: Order): Promise<void> {
  for (const item of order.items) {
    await processOrderItem(item);
  }
}

async function processOrderItem(item: OrderItem): Promise<void> {
  const priceCheck = item.total / item.quantity;
  // Price check logic
  if (priceCheck !== item.price.amount) {
    throw new Error(
      `Price mismatch. Expected ${item.price.amount}, got ${priceCheck}`
    );
  }
  // very complex calculations
}
