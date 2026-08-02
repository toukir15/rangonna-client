export interface IOrderResponse {
  success: boolean;
  message: string;
  data: SingleOrder;
}

export interface SingleOrder {
  _id: string;
  sysid: string;
  reason: string;
  total: number;
  paid: number;
  due: number;
  customer: Customer;
  line_items: LineItem[];
  shipping_line: ShippingLine;
  coupon: Coupon;
  order_created: string;
  status: string;
  payment: Payment;
  user: string;
  domain: string;
  is_print: boolean;
  is_verified: boolean;
  updatedAt: string;
  __v: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer_note?: Record<string, any>;
}

export interface Customer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: {
    city_id: string | null;
    city_name: string;
  };
  zone: {
    zone_id: string | null;
    zone_name: string;
  };
}

export interface LineItem {
  title: string;
  product_id: Product;
  sku?: string;
  size?: string;
  quantity: number;
  subtotal: number;
  total: number;
  price: number;
}

export interface Product {
  _id: string;
  categories: string[];
  featured_image: {
    src: string;
  };
  inventory: {
    stock_quantity: number;
    low_stock_notify: number | null;
    stock_status: "in-stock" | "out-of-stock";
    manage_stock: boolean;
    sold_quantity: number;
  };
}

export interface ShippingLine {
  title: string;
  total: number;
}

export interface Coupon {
  code: string;
  amount: number;
}

export interface Payment {
  title: string;
  transaction_id: string;
  payment_status: "due" | "paid" | string;
}
