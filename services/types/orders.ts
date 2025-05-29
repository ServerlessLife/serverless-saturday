export type Price = {
  amount: number;
  currency: string;
  margin: number;
  discount?: number;
};

export type OrderItem = {
  quantity: number;
  price: Price;
  itemId: string;
  name: string;
  total: number;
};

export type Order = {
  items: OrderItem[];
  timestamp: string;
  orderId: string;
};
