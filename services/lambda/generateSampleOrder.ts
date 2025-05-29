import { Order, OrderItem } from "../types/orders";

export function generateSampleOrder(): Order {
  return {
    orderId: generateOrderId(),
    items: generateSampleOrderItems(),
    timestamp: new Date().toISOString(),
  };
}
function generateSampleOrderItems(): OrderItem[] {
  const sampleProducts = [
    { name: "Gaming Laptop", basePrice: 1299.99 },
    { name: "Wireless Mouse", basePrice: 29.99 },
    { name: "Mechanical Keyboard", basePrice: 89.99 },
    { name: "4K Monitor", basePrice: 399.99 },
    { name: "Gaming Headset", basePrice: 79.99 },
  ];

  const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items
  const orders: OrderItem[] = [];

  for (let i = 0; i < numItems; i++) {
    const product =
      sampleProducts[Math.floor(Math.random() * sampleProducts.length)]!;
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
    const margin = Math.random() * 0.3 + 0.1; // 10-40% margin
    const discount = Math.random() > 0.7 ? Math.random() * 0.1 : undefined; // 30% chance of discount

    const price = {
      amount: product.basePrice,
      currency: "USD",
      margin: margin,
      discount: discount,
    };

    const total = (i === 0 ? (undefined as any) : quantity) * price.amount;

    orders.push({
      itemId: generateRandomItemId(),
      name: product.name,
      quantity: quantity,
      price: i === 0 ? (undefined as any) : price, // Intentionally set to undefined to trigger error
      total: total,
    });
  }

  return orders;
}
function generateRandomItemId(): string {
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ITEM_${randomNum}`;
}
function generateOrderId(): string {
  return `ORDER_123`;
}
