import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { OrderItem, OrderEvent, Order } from "../types/orders";

const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION });

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let orders: OrderItem[];

  if (event.body) {
    orders = JSON.parse(event.body);
  } else {
    // Generate sample orders if no body provided
    orders = generateSampleOrders();
  }

  const orderEvents: OrderEvent[] = orders.map((order) => ({
    orders: [order],
    timestamp: new Date().toISOString(),
    orderId: generateOrderId(),
  }));

  const params = {
    Entries: orderEvents.map((eventDetail) => ({
      Source: "orders.service",
      DetailType: "Order Submitted",
      Detail: JSON.stringify(eventDetail),
      EventBusName: process.env.EVENT_BUS_NAME,
    })),
  };

  await eventBridge.send(new PutEventsCommand(params));
};

function generateSampleOrders(): OrderItem[] {
  const sampleProducts = [
    { name: "Gaming Laptop", price: 1299.99 },
    { name: "Wireless Mouse", price: 29.99 },
    { name: "Mechanical Keyboard", price: 89.99 },
    { name: "4K Monitor", price: 399.99 },
    { name: "Gaming Headset", price: 79.99 },
  ];

  const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items
  const orders: OrderItem[] = [];

  for (let i = 0; i < numItems; i++) {
    const product =
      sampleProducts[Math.floor(Math.random() * sampleProducts.length)]!;
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
    const price = product.price;
    const total = price * quantity;

    orders.push({
      productId: generateRandomProductId(),
      name: product.name,
      quantity: quantity,
      price: price,
      total: total,
    });
  }

  return orders;
}

function generateRandomProductId(): string {
  const prefix = "PROD";
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${randomNum}`;
}

function generateOrderId(): string {
  return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
