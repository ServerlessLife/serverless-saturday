import { EventBridgeEvent, SQSEvent, SQSBatchResponse } from "aws-lambda";
import { OrderItem, Order } from "../types/orders";
import { serializeError } from "serialize-error";

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
      console.error(
        JSON.stringify({
          message: "Order processing failed",
          error: serializeError(error),
          ...order,
        })
      );

      batchItemFailures.push(record.messageId);
    }
  }

  return {
    batchItemFailures: batchItemFailures.map((id) => ({ itemIdentifier: id })),
  };
};

async function processOrder(order: Order): Promise<void> {
  console.log(
    JSON.stringify({
      message: "Processing order from SQS",
      ...order,
    })
  );

  try {
    for (const item of order.items) {
      await processOrderItem(item);
    }
  } catch (error) {
    throw new Error(`Failed to process order ${order.orderId}`, {
      cause: error,
    });
  }
}

async function processOrderItem(item: OrderItem): Promise<void> {
  try {
    const priceCheck = item.total / item.quantity;
    // Price check logic
    if (priceCheck !== item.price.amount) {
      throw new Error(
        `Price mismatch. Expected ${item.price.amount}, got ${priceCheck}`
      );
    }
    // very complex calculations
  } catch (error) {
    throw new Error(`Error processing item ${item.itemId}`, {
      cause: error,
    });
  }
}
